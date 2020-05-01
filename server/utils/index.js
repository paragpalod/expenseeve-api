const Boom = require('@hapi/boom');
const Crypto = require('crypto');

/**
  * Allows you to create custom error
  * @param message error Message
  * @param message err category
  * @param code error statusCode
  */
exports.error = (message, err, statusCode) => {
  // validating all the params
  if (!message) {
    return Boom.expectationFailed('message parameter must be provided is must');
  }

  // creating new error with native node error and boom
  const error = new Error(message.toString());
  Boom.boomify(error, { statusCode: statusCode || 600 });
  error.output.payload.error = err || 'Custom Error';

  return error;
};

exports.encryptUserPassword = (password) => {
  const salt = Crypto.randomBytes(16).toString('base64');
  const hashedPassword = Crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), 10000, 2048, 'RSA-SHA512').toString('base64');
  return { hashedPassword, salt };
};

exports.userAuthenticate = (password, salt, hashedPassword) => (
  hashedPassword === Crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), 10000, 2048, 'RSA-SHA512').toString('base64')
);
