const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const initializeDatabase = require('../database/init');
const cleanupOrphanedFiles = require('../database/cleanup');

/**
 * @description 初始化并连接到 SQLite 数据库
 * @param {string} uploadsDir - 上传目录，用于孤儿文件清理
 * @returns {import('sqlite3').Database}
 */
function connectDatabase(uploadsDir) {
  const dbPath = path.resolve(__dirname, '..', '..', 'data', 'messages.db');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err.message);
    } else {
      console.log('Connected to the SQLite database.');
      // 初始化数据库表结构并执行清理
      initializeDatabase(db, () => cleanupOrphanedFiles(db, uploadsDir));
    }
  });
  return db;
}

module.exports = connectDatabase;
