const Joi = require('@hapi/joi');
const DB = require('../../../models');

const register = {
  auth: false,
  tags: ['api', 'user'],
  validate: {
    payload: Joi.object({
      firstName: Joi.string().required().lowercase().trim().label('Name'),
      lastName: Joi.string().required().trim().label('Display Name'),
      email: Joi.string().email().required().lowercase().trim().label('Email'),
      mobile: Joi.string().required().trim().label('Mobile'),
      password: Joi.string().required().trim().label('Mobile'),
      confirmPassword: Joi.string().required().trim().label('Mobile')
    }),
    failAction: (req, h, err) => err
  },
  handler: async (req) => {
    try {
      if (req.payload.password !== req.payload.confirmPassword) {
        throw {
          isFromThrow: true,
          message: 'Passwords do not match',
          statusCode: 801
        };
      }
      const userObject = req.payload;
      const user = await DB.user.create(userObject);
      user.encryptPassword(req.payload.password);
      user.verify(req);
      await user.save();
      return 'Account created successfully';
    } catch (Exception) { return Exception; }
  }
};

exports.routes = [
  {
    method: 'POST',
    path: '/register',
    config: register
  }
];
