const Joi = require('@hapi/joi');
const DB = require('../../../models');
const Utils = require('../../../utils');
const error = Utils.error;

const createExpense = {
  tags: ['api', 'expense'],
  validate: {
    payload: Joi.object({
      categoryID: Joi.string().required().label('Category'),
      itemName: Joi.string().required().trim().label('Item Name'),
      amount: Joi.number().min(1).required().label('Amount'),
      date: Joi.date().required().label('Date'),
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

      const Category = await DB.category.findById(req.payload.categoryID);
      if (!Category) {
        throw { message: 'Category not found' };
      }

      const EXPENSE = await DB.expense.create(req.payload);
      return EXPENSE;
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

const updateExpense = {
  tags: ['api', 'expense'],
  validate: {
    params: Joi.object({
      expenseID: Joi.string().required().label('Expense')
    }),
    payload: Joi.object({
      itemName: Joi.string().required().trim().label('Item Name'),
      amount: Joi.number().required().label('Amount'),
      categoryID: Joi.string().required().label('Category'),
      userID: Joi.string().required().label('User'),
      date: Joi.date().required().label('Date')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  async handler (req) {
    try {
      console.log(req.payload);
      let Expense = await DB.expense.findById(req.params.expenseID);
      if (!Expense) {
        throw { message: 'Expense not found.' };
      }

      const User = await DB.user.findById(req.payload.userID);
      if (!User) {
        throw { message: 'User not found' };
      }

      const Category = await DB.category.findById(req.payload.categoryID);
      if (!Category) {
        throw { message: 'Category not found' };
      }

      Expense = Object.assign(Expense, req.payload);
      const EXPENSE = await Expense.save();
      return EXPENSE;
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

const getExpenseList = {
  tags: ['api', 'expense'],
  validate: {
    query: Joi.object({
      userID: Joi.string().label('User'),
      categoryID: Joi.string().label('Category')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  async handler (req) {
    try {
      const where = {};
      if (req.query.userID) {
        where.userID = req.query.userID;
      }
      if (req.query.categoryID) {
        where.categoryID = req.query.categoryID;
      }
      const EXPENSES = await DB.expense.find(where).sort({ createdAt: -1 });
      return EXPENSES;
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

const deleteExpense = {
  tags: ['api', 'expense'],
  description: 'Soft delete expenses',
  validate: {
    params: Joi.object({
      expenseID: Joi.string().required().label('Expense'),
      action: Joi.string().valid('activate', 'deactivate').required().label('Action')
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  async handler (req) {
    try {
      const expense = await DB.expense.findById(req.params.expenseID);
      if (!expense) {
        throw { message: 'Expense not found.' };
      }
      if (req.params.action === 'activate') {
        expense.deletedAt = null;
      } else {
        expense.deletedAt = new Date(Date.now());
      }
      await expense.save();
      return `Expense ${req.params.action}d successfully`;
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
    path: '/expense',
    config: createExpense
  },
  {
    method: 'PUT',
    path: '/expense/{expenseID}',
    config: updateExpense
  },
  {
    method: 'GET',
    path: '/expenses',
    config: getExpenseList
  },
  {
    method: 'PUT',
    path: '/expense/{expenseID}/{action}',
    config: deleteExpense
  }
];
