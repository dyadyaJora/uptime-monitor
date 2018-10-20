let crypto = require('crypto');

exports.md5Hash = function (password, salt) {
  salt = salt || '';
  return crypto.createHash('md5').update(password + salt, 'utf-8').digest('hex');
};

exports.createSalt = function () {
  return crypto.randomBytes(128).toString('hex');
};

exports.checkPassword = function (pass, hash, salt) {
  if (!pass || !hash) return false;

  return hash === exports.md5Hash(pass, salt);
};