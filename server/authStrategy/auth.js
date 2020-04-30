const DB = require('../models');
const jwt = require('jsonwebtoken');
const Boom = require('@hapi/boom');
const config = require('../config');

exports.plugin = {
  name: 'auth',
  register: function (server) {
    const scheme = function () {
      return {
        authenticate: async function (req, h) {
          const authorization = req.headers.authorization;

          if (!authorization) {
            throw Boom.unauthorized(null, 'Custom');
          }
          try {
            const decoded = jwt.verify(req.headers.authorization, config.serverSecret);

            if (!(decoded._id)) {
              throw Boom.unauthorized(null, 'Custom');
            }

            const session = await DB.session.findOne({ _id: decoded._id });

            if (!session) {
              throw Boom.unauthorized(null, 'Custom');
            }

            const userFields = [
              'username',
              'name'
            ];
            const user = await DB.user.findOne({ _id: session.userID }).select(userFields.join(" "));
            if (!user || user.isSiloAdmin || user.deletedAt || !user.isVerified) {
              throw Boom.unauthorized(null, 'Custom');
            }
            user.session = session;
            return h.authenticated({ credentials: user });
          } catch (JWTException) {
            throw Boom.unauthorized(null, 'Custom');
          }
        }
      };
    };
    server.auth.scheme('jwt', scheme);
    server.auth.strategy('jwt', 'jwt');
    server.auth.default('jwt');
  }
};
