const express = require('express');
const router = express.Router();

/**
 * @description 主页路由
 * @param {import('sqlite3').Database} db - 数据库实例
 * @returns {express.Router}
 */
module.exports = function(db) {
  // 渲染主页面
  router.get('/', (req, res) => {
    // 如果用户已登录，则将用户信息传递给模板
    const userInfo = req.userId ? { id: req.userId, username: req.username } : null;
    db.all("SELECT * FROM messages WHERE is_private = 0 ORDER BY timestamp DESC", [], (err, rows) => {
      if (err) {
        res.status(500).send("Error fetching messages");
        return;
      }
      res.render('index', { messages: rows, user: userInfo });
    });
  });

  return router;
};
