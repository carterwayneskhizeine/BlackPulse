const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * @description 文件上传相关的路由
 * @param {import('multer').Multer} upload - 用于旧 'image' 字段的 multer 实例
 * @param {import('multer').Multer} generalUpload - 用于新 'file' 字段的 multer 实例
 * @param {string} uploadsDir - 上传目录
 * @returns {express.Router}
 */
module.exports = function(upload, generalUpload, uploadsDir) {
  // API: 上传图片/文件 (为保持向后兼容性保留此端点)
  router.post('/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // 返回成功响应及文件信息
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

      // 如果出错，清理已上传的文件
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

  // API: 上传任意类型的文件
  router.post('/upload-file', generalUpload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // 对大文件的额外验证
      if (req.file.size > 50 * 1024 * 1024) { // 50MB
        // 清理已上传的文件
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
        return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
      }

      // 返回成功响应及文件信息
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

      // 如果出错，清理已上传的文件
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

  return router;
};
