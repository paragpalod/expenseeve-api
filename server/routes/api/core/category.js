const Joi = require('@hapi/joi');
const DB = require('../../../models');
const Utils = require('../../../utils');
const error = Utils.error;

const createCategory = {
  tags: ['api', 'category'],
  validate: {
    payload: Joi.object({
      name: Joi.string().required().label('Name'),
      userID: Joi.string().required().label('User')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  async handler (req) {
    try {
      const User = await DB.user.findById(req.payload.userID);
      if (!User) {
        throw { message: 'User not found' };
      }
      const CATEGORY = await DB.category.create(req.payload);
      return CATEGORY;
    } catch (Exception) {
      if (Exception.errors && Exception.errors[Object.keys(Exception.errors)[0]].message) {
        // this is error related to mongoose and mongoose schema
        return error(Exception.errors[Object.keys(Exception.errors)[0]].message, 'Database', 700);
      } else if (Exception && Exception.code === 11000) {
        // this is error related to mongodb database if created entry validated the unique value
        return error('Category already exists', 'Database', 700);
      } else {
        return error(Exception.message);
      }
    }
  }
};

const getCategoryList = {
  tags: ['api', 'category'],
  validate: {
    query: Joi.object({
      userID: Joi.string().label('User'),
      activationStatus: Joi.string().label('Activation Status')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  async handler (req) {
    try {
      const Query = {
        userID: req.query.userID
      };
      if (req.query.activationStatus === 'active') Query.deletedAt = null;
      if (req.query.activationStatus === 'inactive') Query.deletedAt = { $ne: null };
      const CATEGORIES = await DB.category.find(Query).sort({ createdAt: -1 });
      return CATEGORIES;
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

const deleteCategory = {
  tags: ['api', 'category'],
  description: 'Soft delete category',
  validate: {
    params: Joi.object({
      categoryID: Joi.string().required().label('Category'),
      action: Joi.string().valid('activate', 'deactivate').required().label('Action')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  async handler (req) {
    try {
      const category = await DB.category.findById(req.params.categoryID);
      if (!category) {
        throw { message: 'Category not found.' };
      }
      if (req.params.action === 'activate') {
        category.deletedAt = null;
      } else {
        category.deletedAt = new Date(Date.now());
      }
      await category.save();
      return `Category ${req.params.action}d successfully`;
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
    method: 'POST',
    path: '/category',
    config: createCategory
  },
  {
    method: 'GET',
    path: '/categories',
    config: getCategoryList
  },
  {
    method: 'PUT',
    path: '/category/{categoryID}/{action}',
    config: deleteCategory
  }
];
