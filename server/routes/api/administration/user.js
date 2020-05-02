const Joi = require('@hapi/joi');
const DB = require('../../../models');
const Utils = require('../../../utils');
const error = Utils.error;

const updateUsername = {
  tags: ['api', 'user'],
  validate: {
    params: Joi.object({
      userID: Joi.string().required().label('User')
    }),
    payload: Joi.object({
      username: Joi.string().label('Username')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  handler: async (req) => {
    try {
      // validatinng unique username condition
      const USER = await DB.user.findOne({ username: req.payload.username, _id: { $ne: req.params.userID } });
      if (USER) {
        throw { message: 'Username already exists.' };
      }

      // finding and updating username in user model
      const User = await DB.user.findOne({ _id: req.params.userID });
      if (!User) {
        throw { message: 'User not found' };
      }
      User.username = req.payload.username;
      const UpdatedUser = await User.save();

      // creating a new userinfo object for localstorage
      const UserInfo = {
        _id: UpdatedUser._id,
        username: UpdatedUser.username,
        name: UpdatedUser.name,
        totalBudget: UpdatedUser.totalBudget
      };

      return UserInfo;
    } catch (Exception) {
      if (Exception.errors && Exception.errors[Object.keys(Exception.errors)[0]].message) {
        // this is error related to mongoose and mongoose schema
        return error(Exception.errors[Object.keys(Exception.errors)[0]].message, 'Database', 700);
      } else {
        return error(Exception.message);
      }
    }
  }
};

const updateName = {
  tags: ['api', 'user'],
  validate: {
    params: Joi.object({
      userID: Joi.string().required().label('User')
    }),
    payload: Joi.object({
      name: Joi.string().label('Name')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  handler: async (req) => {
    try {
      // finding and updating name in user model
      const User = await DB.user.findOne({ _id: req.params.userID });
      if (!User) {
        throw { message: 'User not found' };
      }

      User.name = req.payload.name;
      const USER = await User.save();

      const UserInfo = {
        _id: USER._id,
        username: USER.username,
        name: USER.name,
        totalBudget: USER.totalBudget
      };

      return UserInfo;
    } catch (Exception) {
      if (Exception.errors && Exception.errors[Object.keys(Exception.errors)[0]].message) {
        // this is error related to mongoose and mongoose schema
        return error(Exception.errors[Object.keys(Exception.errors)[0]].message, 'Database', 700);
      } else {
        return error(Exception.message);
      }
    }
  }
};

const updateTotalBudget = {
  tags: ['api', 'user'],
  validate: {
    params: Joi.object({
      userID: Joi.string().required().label('User')
    }),
    payload: Joi.object({
      totalBudget: Joi.number().min(1).label('Total Budget')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  handler: async (req) => {
    try {
      // finding and updating username inuser model
      const User = await DB.user.findOne({ _id: req.params.userID });
      if (!User) {
        throw { message: 'User not found' };
      }

      User.totalBudget = req.payload.totalBudget;
      const USER = await User.save();

      const UserInfo = {
        _id: USER._id,
        username: USER.username,
        name: USER.name,
        totalBudget: USER.totalBudget
      };

      return UserInfo;
    } catch (Exception) {
      if (Exception.errors && Exception.errors[Object.keys(Exception.errors)[0]].message) {
        // this is error related to mongoose and mongoose schema
        return error(Exception.errors[Object.keys(Exception.errors)[0]].message, 'Database', 700);
      } else {
        return error(Exception.message);
      }
    }
  }
};

exports.routes = [
  {
    method: 'PUT',
    path: '/updateUsername/{userID}',
    config: updateUsername
  },
  {
    method: 'PUT',
    path: '/updateName/{userID}',
    config: updateName
  },
  {
    method: 'PUT',
    path: '/updateTotalBudget/{userID}',
    config: updateTotalBudget
  }
];
