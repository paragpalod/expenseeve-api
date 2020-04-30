const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const SERVER_SECRET = require('../../../config').serverSecret;
const DB = require('../../../models');

const login = {
  auth: false,
  tags: ['api', 'authentication'],
  validate: {
    payload: Joi.object({
      username: Joi.string().required().lowercase().label('Username'),
      password: Joi.string().required().label("Password")
    }),
    failAction: (req, h, err) => err
  },
  handler: async (req) => {
    try {
      const where = {};
      if (isNaN(Number(req.payload.username))) {
        where.email = req.payload.username;
      } else {
        where.mobile = req.payload.username;
      }
      const user = await DB.user.findOne(where);
      if (!user) {
        throw {
          isFromThrow: true,
          message: 'Invalid Credentials',
          statusCode: 700
        };
      }

      if (user.deletedAt) {
        throw {
          isFromThrow: true,
          message: 'Your account is deactivated.',
          statusCode: 701
        };
      }

      if (!user.isVerified) {
        throw {
          isFromThrow: true,
          message: 'Your account is not verified. Please verify your account and login again.',
          statusCode: 702
        };
      }

      if (!user.authenticate(req.payload.password)) {
        user.loginAttempts += 1;
        if (user.loginAttempts === 5) {
          // if loginAttempts are 5 then set lockuntill time = now time + 30 getSeconds
          // so user can login after 30 seconds of 5 fail attampts
          user.lockUntill = new Date(new Date().setSeconds(new Date().getSeconds() + 30));
        } else {
          if (user.loginAttempts > 5 && new Date() < user.lockUntill) {
            // after 5 failed attempts user need to wait for 30 seconds
            throw {
              isFromThrow: true,
              message: 'Too many failed login attempts. Please try again in 30 seconds',
              statusCode: 703
            };
          }

          if (user.loginAttempts > 5 && new Date() > user.lockUntill) {
            // on 6 th attempts and after 30 seconds of 5 fail attempts reset login attempts to 1 and lockuntill
            user.loginAttempts = 1;
            user.lockUntill = undefined;
          }
        }

        await user.save();
        throw {
          isFromThrow: true,
          message: 'Invalid Credentials',
          statusCode: 700
        };
      } else {
        if ((user.loginAttempts <= 5) && (!user.lockUntill || new Date() > user.lockUntill)) {
          // Build session for the current user
          const session = {
            userID: user._id,
            createdBy: user._id,
            updatedBy: user._id,
            companyID: user.companyID
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

          // created a object userInfo to provide data as per front- end theme
          // following key are added with role name obtained earlier
          const UserInfo = {
            _id: USER._id,
            firstName: USER.firstName,
            lastName: USER.lastName,
            email: USER.email,
            mobile: USER.mobile,
            deletedAt: USER.deletedAt,
            isVerified: USER.isVerified,
            isSiloAdmin: USER.isSiloAdmin,
            activeSession: USER.activeSession
          };
          return { token, user: UserInfo };
        } else {
          // If the user is locked, but password entered is correct, user should not be logged in
          // Respective error should be thrown.
          throw {
            isFromThrow: true,
            message: 'Too many failed login attempts. Please try again in 30 seconds',
            statusCode: 703
          };
        }
      }
    } catch (Exception) { return Exception; }
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
    } catch (Exception) { return Exception; }
  }
};

const verifyToken = {
  auth: false,
  tags: ['api', 'authentication'],
  validate: {
    payload: Joi.object({
      verificationToken: Joi.string(),
      resetPasswordToken: Joi.string()
    }),
    failAction: (req, h, err) => err
  },
  handler: async (req) => {
    try {
      if (!req.payload.verificationToken && !req.payload.resetPasswordToken) {
        throw {
          isFromThrow: true,
          message: 'Token is not provided in payload',
          statusCode: 600
        };
      }
      let user = {};
      if (req.payload.verificationToken) {
        user = await DB.user.findOne({ verificationToken: req.payload.verificationToken });
      }
      if (req.payload.resetPasswordToken) {
        user = await DB.user.findOne({ resetPasswordToken: req.payload.resetPasswordToken });
      }
      if (!user) {
        throw {
          isFromThrow: true,
          message: 'You can not use same link twice',
          statusCode: 805
        };
      } else {
        if (user.isVerified && req.payload.verificationToken) {
          throw {
            isFromThrow: true,
            message: 'Your account is already verified',
            statusCode: 805
          };
        } else if (user.isResetTokenVerified && req.payload.resetPasswordToken) {
          throw {
            isFromThrow: true,
            message: 'Your new password has been created before using this link request for another reset password link',
            statusCode: 805
          };
        } else {
          await jwt.verify(req.payload.verificationToken ? user.verificationToken : user.resetPasswordToken, SERVER_SECRET, (err) => {
            if (err) {
              throw {
                isFromThrow: true,
                message: err.message,
                statusCode: 900
              };
            }
          });
          // making user verified and giving him access to his dummy project account
          user.isVerified = true;
          user.verificationToken = undefined;
          await user.save();

          return 'Token Verified Successfully';
        }
      }
    } catch (Exception) { return Exception; }
  }
};

const validateSession = {
  auth: false,
  tags: ['api', 'authentication'],
  validate: {
    params: Joi.object({
      token: Joi.string().required()
    }),
    failAction: (req, h, err) => err
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
      const USER = await DB.user.findOne({ _id: session.userID, deletedAt: null });

      // created a object userInfo to provide data as per front- end theme
      // following key are added with role name obtained earlier
      const UserInfo = {
        _id: USER._id,
        firstName: USER.firstName,
        lastName: USER.lastName,
        email: USER.email,
        mobile: USER.mobile,
        deletedAt: USER.deletedAt,
        isVerified: USER.isVerified,
        isSiloAdmin: USER.isSiloAdmin,
        activeSession: USER.activeSession
      };
      return { token: SESSION.token, user: UserInfo };
    } catch (Exception) { return Exception; }
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
  method: 'PUT',
  path: '/verifyToken',
  config: verifyToken
},
{
  method: 'GET',
  path: '/validateSession/{token}',
  config: validateSession
}
];
