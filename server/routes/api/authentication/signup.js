const Joi = require('@hapi/joi');
const DB = require('../../../models');
const Utils = require('../../../utils');
const error = Utils.error;

const signup = {
  auth: false,
  tags: ['api', 'user'],
  validate: {
    payload: Joi.object({
      username: Joi.string().required().trim().label('Username'),
      name: Joi.string().required().trim().label('Name'),
      password: Joi.string().required().trim().label('Password'),
      confirmPassword: Joi.string().required().trim().label('Confirm Password')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  handler: async (req) => {
    try {
      // validating both password match condition
      if (req.payload.password !== req.payload.confirmPassword) {
        throw { message: 'Passwords do not match' };
      }

      // creating userObject from Payload
      const userObject = {
        username: req.payload.username,
        name: req.payload.name
      };

      // destructuring  received hashedPassword amd salt encryptUserPassword function
      const { hashedPassword, salt } = Utils.encryptUserPassword(req.payload.password);
      userObject.hashedPassword = hashedPassword;
      userObject.salt = salt;

      // creating new user
      await DB.user.create(userObject);

      return 'Account created successfully';
    } catch (Exception) {
      if (Exception.errors && Exception.errors[Object.keys(Exception.errors)[0]].message) {
        // this is error related to mongoose and mongoose schema
        return error(Exception.errors[Object.keys(Exception.errors)[0]].message, 'Database', 700);
      } else if (Exception && Exception.code === 11000) {
        // this is error related to mongodb database if created entry validated the unique value
        return error('User already exists', 'Database', 700);
      } else {
        return error(Exception.message);
      }
    }
  }
};

exports.routes = [
  {
    method: 'POST',
    path: '/signup',
    config: signup
  }
];
