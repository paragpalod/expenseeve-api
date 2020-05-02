const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const SERVER_SECRET = require('../../../config').serverSecret;
const DB = require('../../../models');
const Utils = require('../../../utils');
const error = Utils.error;

const login = {
  auth: false,
  tags: ['api', 'authentication'],
  validate: {
    payload: Joi.object({
      username: Joi.string().required().lowercase().label('Username'),
      password: Joi.string().required().label("Password")
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  handler: async (req) => {
    try {
      // searching user in database
      const user = await DB.user.findOne({ username: req.payload.username });
      if (!user) {
        throw { message: 'Invalid Credentials' };
      }

      // validating user password
      if (!Utils.userAuthenticate(req.payload.password, user.salt, user.hashedPassword)) {
        user.loginAttempts += 1;
        if (user.loginAttempts === 3) {
          // if login Attempts are equel to 4 than lock the user for 30 seconds
          user.lockUntill = new Date(new Date().setSeconds(new Date().getSeconds() + 30));
        } else {
          if (user.loginAttempts > 3 && new Date() < user.lockUntill) {
            // after 3 failed attempts user need to wait for 30 seconds
            throw { message: 'Too many failed login attempts. Please try again in 30 seconds' };
          }

          if (user.loginAttempts > 3 && new Date() > user.lockUntill) {
            // on 4 th attempts and after 30 seconds of 3 fail attempts reset login attempts to 1 and lockuntill
            user.loginAttempts = 1;
            user.lockUntill = undefined;
          }
        }

        await user.save();
        throw { message: 'Invalid Credentials' };
      } else {
        if ((user.loginAttempts <= 3) && (!user.lockUntill || new Date() > user.lockUntill)) {
          // Build session for the current user
          const session = {
            userID: user._id
          };
          delete req.payload.password;
          session.expiresIn = 691200;
          session.metadata = JSON.stringify(req.payload);

          // Save the current session of user
          const createdSession = await DB.session.create(session);
          const token = jwt.sign({
            _id: createdSession._id,
            source: 'portal'
          }, SERVER_SECRET, {
            expiresIn: 691200
          });
          createdSession.token = token;
          await createdSession.save();
          user.loginAttempts = 0;
          user.lockUntill = undefined;

          const USER = await user.save();

          const UserInfo = {
            _id: USER._id,
            username: USER.username,
            name: USER.name,
            totalBugdet: USER.totalBugdet
          };

          return { token, user: UserInfo };
        } else {
          // If the user is locked, but password entered is correct, user should not be logged in
          throw { message: 'Too many failed login attempts. Please try again in 30 seconds' };
        }
      }
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

const logout = {
  tags: ['api', 'authentication'],
  handler: async (req) => {
    try {
      if (req.auth.credentials.session) {
        await DB.session.deleteOne({ _id: req.auth.credentials.session._id });
        return 'Logout successfully';
      } else {
        return '';
      }
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

const validateSession = {
  auth: false,
  tags: ['api', 'authentication'],
  validate: {
    params: Joi.object({
      token: Joi.string().required()
    }),
    failAction: (req, h, err) => error(err.details[0].message, 'Payload/Query/Params Validation', 700)
  },
  handler: async (req) => {
    try {
      const where = {
        token: req.params.token
      };
      const decoded = jwt.verify(where.token, SERVER_SECRET);

      where._id = decoded._id;

      const session = await DB.session.findOne(where);
      if (!session || !decoded) {
        throw {
          isFromThrow: true,
          message: 'Session Expired.',
          statusCode: 401
        };
      }
      // creating new token for this user
      const token = jwt.sign({
        _id: session._id,
        source: 'portal'
      }, SERVER_SECRET, {
        expiresIn: 691200
      });
      // saving created token on session
      session.token = token;
      const SESSION = await session.save();
      // find the user for whom this session was created  to provide updated data to the client side
      const USER = await DB.user.findOne({ _id: session.userID });

      // created a object userInfo to provide data for localstorage
      const UserInfo = {
        _id: USER._id,
        username: USER.username,
        name: USER.name,
        totalBugdet: USER.totalBugdet
      };
      return { token: SESSION.token, user: UserInfo };
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

exports.routes = [{
  method: 'POST',
  path: '/login',
  config: login
},
{
  method: 'DELETE',
  path: '/logout',
  config: logout
},
{
  method: 'GET',
  path: '/validateSession/{token}',
  config: validateSession
}
];
