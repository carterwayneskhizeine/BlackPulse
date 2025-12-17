/**
 * 初始化数据库表结构和索引
 * @param {import('sqlite3').Database} db - SQLite 数据库实例
 * @param {() => void} cleanupOrphanedImages - 清理孤儿文件的函数
 */
function initializeDatabase(db, cleanupOrphanedImages) {
  // 创建 messages 表
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_private INTEGER DEFAULT 0,
    private_key TEXT DEFAULT NULL,
    user_id INTEGER DEFAULT NULL,
    has_image INTEGER DEFAULT 0,
    image_filename TEXT DEFAULT NULL,
    image_mime_type TEXT DEFAULT NULL,
    image_size INTEGER DEFAULT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating messages table:', err.message);
    } else {
      console.log('Messages table created or already exists.');

      // 确保现有表也有新字段（如果表已存在但缺少字段）
      addMissingColumns();
    }
  });

  // 添加缺失的列
  function addMissingColumns() {
    const alterColumns = [
      { sql: `ALTER TABLE messages ADD COLUMN is_private INTEGER DEFAULT 0`, name: 'is_private' },
      { sql: `ALTER TABLE messages ADD COLUMN private_key TEXT DEFAULT NULL`, name: 'private_key' },
      { sql: `ALTER TABLE messages ADD COLUMN user_id INTEGER DEFAULT NULL`, name: 'user_id' },
      { sql: `ALTER TABLE messages ADD COLUMN has_image INTEGER DEFAULT 0`, name: 'has_image' },
      { sql: `ALTER TABLE messages ADD COLUMN image_filename TEXT DEFAULT NULL`, name: 'image_filename' },
      { sql: `ALTER TABLE messages ADD COLUMN image_mime_type TEXT DEFAULT NULL`, name: 'image_mime_type' },
      { sql: `ALTER TABLE messages ADD COLUMN image_size INTEGER DEFAULT NULL`, name: 'image_size' }
    ];

    let completed = 0;

    alterColumns.forEach((column) => {
      db.run(column.sql, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error(`Error adding ${column.name} column:`, err.message);
        } else if (!err || err.message.includes('duplicate column name')) {
          console.log(`${column.name} column added or already exists.`);
        }

        completed++;
        if (completed === alterColumns.length) {
          // 所有列添加完成后，创建 users 表
          createUsersTable();
        }
      });
    });
  }

  // 创建 users 表
  function createUsersTable() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists.');

        // 创建 comments 表
        createCommentsTable();
      }
    });
  }

  // 创建 comments 表
  function createCommentsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pid INTEGER DEFAULT NULL,  -- 父评论ID，用于回复
      user_id INTEGER DEFAULT NULL,  -- 用户ID，NULL表示匿名用户
      username TEXT NOT NULL,  -- 用户名，即使是匿名用户也会有名称
      text TEXT NOT NULL,  -- 评论内容
      score INTEGER DEFAULT 0,  -- 评论分数（赞/踩）
      votes TEXT DEFAULT '{}',  -- 存储投票信息，格式为JSON字符串
      time DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 评论时间
      is_deleted INTEGER DEFAULT 0,  -- 是否删除
      is_editable INTEGER DEFAULT 1,  -- 是否可编辑
      message_id INTEGER,  -- 关联的消息ID
      upvotes INTEGER DEFAULT 0,  -- 赞同票数
      downvotes INTEGER DEFAULT 0,  -- 反对票数
      FOREIGN KEY(message_id) REFERENCES messages(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating comments table:', err.message);
      } else {
        console.log('Comments table created or already exists.');

        // 创建数据库索引
        createDatabaseIndexes();
      }
    });
  }

  // 创建数据库索引
  function createDatabaseIndexes() {
    console.log('Creating database indexes for performance optimization...');

    const indexes = [
      { sql: `CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC)`, name: 'idx_messages_timestamp' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_messages_is_private ON messages(is_private)`, name: 'idx_messages_is_private' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id)`, name: 'idx_messages_user_id' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_messages_private_key ON messages(private_key)`, name: 'idx_messages_private_key' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_messages_has_image ON messages(has_image)`, name: 'idx_messages_has_image' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`, name: 'idx_users_username' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_comments_time ON comments(time DESC)`, name: 'idx_comments_time' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_comments_pid ON comments(pid)`, name: 'idx_comments_pid' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)`, name: 'idx_comments_user_id' },
      { sql: `CREATE INDEX IF NOT EXISTS idx_comments_message_id ON comments(message_id)`, name: 'idx_comments_message_id' }
    ];

    let completed = 0;

    indexes.forEach((index) => {
      db.run(index.sql, (err) => {
        if (err) {
          console.error(`Error creating ${index.name} index:`, err.message);
        } else {
          console.log(`Index ${index.name} created or already exists.`);
        }

        completed++;
        if (completed === indexes.length) {
          console.log('Database indexes creation completed.');

          // 数据库初始化完成后，清理孤儿图片文件
          cleanupOrphanedImages();

          // 每小时清理一次孤儿图片文件
          setInterval(cleanupOrphanedImages, 60 * 60 * 1000);
        }
      });
    });
  }
}

module.exports = initializeDatabase;
