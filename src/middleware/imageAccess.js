/**
 * @description 检查图片访问权限的中间件
 * @param {import('sqlite3').Database} db - 数据库实例
 * @returns {import('express').Handler}
 */
module.exports = function(db) {
  return function(req, res, next) {
    const filename = req.params.filename;

    // 查找与此图片关联的消息
    db.get(`SELECT * FROM messages WHERE image_filename = ?`, [filename], (err, message) => {
      if (err) {
        console.error('Database error checking image access:', err);
        return res.status(500).send('Internal server error');
      }

      if (!message) {
        // 图片未与任何消息关联 - 允许访问 (可能是孤儿文件)
        return next();
      }

      // 检查用户是否可以访问此消息
      const canAccess =
        // 公开消息
        message.is_private === 0 ||
        // 用户已登录且拥有该私有消息
        (message.is_private === 1 && req.userId && message.user_id === req.userId) ||
        // 提供的私钥匹配
        (message.is_private === 1 && req.query.privateKey && req.query.privateKey === message.private_key);

      if (canAccess) {
        next();
      } else {
        res.status(403).send('Access denied');
      }
    });
  }
};
