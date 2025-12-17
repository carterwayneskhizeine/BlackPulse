const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
// 导入工具函数
const { hashPassword, comparePassword } = require('./utils/password');
const initializeDatabase = require('./database/init');
const cleanupOrphanedFiles = require('./database/cleanup');

// 导入中间件
const { upload, generalUpload, uploadsDir } = require('./middleware/upload');

const app = express();
const port = 1989;

// Increase timeout for large file uploads
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});



// The database file will be created in the /app/data directory inside the container
const dbPath = path.resolve(__dirname, '..', 'data', 'messages.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // 初始化数据库表结构
    initializeDatabase(db, () => cleanupOrphanedFiles(db, uploadsDir));
  }
});



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Session middleware
const sessionMiddleware = require('./middleware/session');
app.use(sessionMiddleware);

// Auth Middleware
const { requireAuth, createGetCurrentUserMiddleware } = require('./middleware/auth');
const getCurrentUser = createGetCurrentUserMiddleware(db);
app.use(getCurrentUser);

// Middleware to check image access permissions
app.use('/uploads/:filename', (req, res, next) => {
  const filename = req.params.filename;

  // Find message associated with this image
  db.get(`SELECT * FROM messages WHERE image_filename = ?`, [filename], (err, message) => {
    if (err) {
      console.error('Database error checking image access:', err);
      return res.status(500).send('Internal server error');
    }

    if (!message) {
      // Image not associated with any message - allow access (could be orphaned file)
      return next();
    }

    // Check if user can access this message
    const canAccess =
      // Public message
      message.is_private === 0 ||
      // User is logged in and owns the private message
      (message.is_private === 1 && req.userId && message.user_id === req.userId) ||
      // Private key provided matches
      (message.is_private === 1 && req.query.privateKey && req.query.privateKey === message.private_key);

    if (canAccess) {
      next();
    } else {
      res.status(403).send('Access denied');
    }
  });
});

// Static file serving for uploads (after permission check)
app.use('/uploads', express.static(uploadsDir));

// Render main page
app.get('/', (req, res) => {
  // Pass user info to template if logged in
  const userInfo = req.userId ? { id: req.userId, username: req.username } : null;
  db.all("SELECT * FROM messages WHERE is_private = 0 ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) {
      res.status(500).send("Error fetching messages");
      return;
    }
    res.render('index', { messages: rows, user: userInfo });
  });
});

// ==================== API 路由 ====================
const authRoutes = require('./routes/auth')(db);
app.use('/api/auth', authRoutes);

// ==================== Image Upload API ====================

// API: Upload image/file (keeping this endpoint for backward compatibility, but now supports all file types)
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Return success response with file info
    res.status(201).json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('File upload error:', error);

    // Clean up file if there was an error
    if (req.file && req.file.filename) {
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }

    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// API: Upload any type of file
app.post('/api/upload-file', generalUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Additional validation for large files
    // Check if file size is within limits (redundant with multer but good to double-check)
    if (req.file.size > 50 * 1024 * 1024) { // 50MB
      // Clean up the uploaded file
      fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }

    // Return success response with file info
    res.status(201).json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('File upload error:', error);

    // Clean up file if there was an error
    if (req.file && req.file.filename) {
      try {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }

    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// ==================== Messages API ====================

const messageRoutes = require('./routes/messages')(db, uploadsDir);

app.use('/api/messages', messageRoutes);

// ==================== Comments API ====================
const commentRoutes = require('./routes/comments')(db);
app.use('/api/comments', commentRoutes);



const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Set server timeout for large uploads
server.setTimeout(300000); // 5 minutes
