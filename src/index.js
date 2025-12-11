const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 1989;

// The database file will be created in the /app/data directory inside the container
const dbPath = path.resolve(__dirname, '..', 'data', 'messages.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Render main page
app.get('/', (req, res) => {
  db.all("SELECT * FROM messages ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) {
      res.status(500).send("Error fetching messages");
      return;
    }
    res.render('index', { messages: rows });
  });
});

// API: Get all messages
app.get('/api/messages', (req, res) => {
  db.all("SELECT * FROM messages ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API: Post a new message
app.post('/api/messages', (req, res) => {
  const { content } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  db.run(`INSERT INTO messages (content) VALUES (?)`, [content], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// API: Delete a message
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM messages WHERE id = ?`, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(204).send(); // No content
  });
});

// API: Update a message
app.put('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  db.run(`UPDATE messages SET content = ? WHERE id = ?`, [content, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(200).json({ message: 'Message updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
