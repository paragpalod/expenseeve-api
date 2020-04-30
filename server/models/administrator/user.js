const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { verificationLink, serverSecret } = require('../../config');
const SERVER_SECRET = serverSecret;
const APP_URL = verificationLink.baseURL;
const email = require('../../utils/email');

module.exports = function (Schema) {
  const User = new Schema({
    email: {
      required: true,
      type: String,
      unique: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    hashedPassword: {
      type: String
    },
    salt: {
      type: String
    },
    mobile: {
      type: String,
      required: true,
      unique: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String
    },
    resetPasswordToken: {
      type: String
    },
    loginAttempts: {
      type: Number,
      default: 0,
      comment: 'login attempts count upto 5 failed attempts,for preventing brute force attack'
    },
    lockUntill: {
      type: Date,
      comment: 'after 5 failed attempt, user need to wait for some time to try login again '
    },
    isSiloAdmin: {
      type: Boolean,
      default: false
    },
    isResetTokenVerified: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    session: {
      type: Object
    },
    version: {
      type: String
    }
  }, { timestamps: true });

  User.methods.encryptPassword = function (password) {
    if (!password) {
      return false;
    }

    this.salt = crypto.randomBytes(16).toString('base64');

    const salt = Buffer.alloc(this.salt, 'base64');

    this.hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 2048, 'RSA-SHA512').toString('base64');
  };

  User.methods.authenticate = function (password) {
    const salt = Buffer.from(this.salt, 'base64');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 2048, 'RSA-SHA512').toString('base64');

    return this.hashedPassword === hashedPassword;
  };

  User.methods.verify = function (req) {
    this.isVerified = false;
    const verificationToken = jwt.sign({ id: this._id }, SERVER_SECRET, { expiresIn: 24 * 60 * 60 * 1000 });

    this.verificationToken = verificationToken;
    const link = APP_URL + verificationToken;
    email.sendMail(`${this.firstName} ${this.lastName}`, this.email, link, 'verificationEmail', req);
    return link;
  };

  return User;
};
