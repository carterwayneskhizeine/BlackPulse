const bcrypt = require('bcrypt');

/**
 * 哈希密码
 * @param {string} password - 明文密码
 * @returns {Promise<string>} - 哈希后的密码
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hash - 哈希密码
 * @returns {Promise<boolean>} - 密码是否匹配
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
};