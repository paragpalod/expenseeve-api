exports.manifest = {
  server: {
    host: 'localhost',
    port: 8080,
    routes: {
      cors: true
    },
    router: {
      stripTrailingSlash: true
    }
  },
  register: {
    plugins: [
      {
        plugin: require('@hapi/basic')
      },
      {
        plugin: './authStrategy/auth'
      },
      {
        plugin: './authStrategy/developerauth'
      },
      {
        plugin: './routes',
        routes: { prefix: '/api' }
      },
      {
        plugin: require('@hapi/inert')
      },
      {
        plugin: require('vision')
      },
      {
        plugin: require('hapi-swagger'),
        options: {
          grouping: 'tags',
          securityDefinitions: {
            bearer: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header'
            }
          },
          security: [
            { bearer: [] }
          ],
          info: {
            title: 'Dummy Project',
            description: 'REST APIs to access and administer project resources',
            version: '1.0'
          },
          auth: 'developer'
        }
      },
      {
        plugin: require('@hapi/good'),
        options: {
          ops: {
            interval: 5000
          },
          includes: {
            request: ['headers', 'payload'],
            response: ['payload']
          },
          reporters: {
            myConsoleReporter: [{
              module: '@hapi/good-squeeze',
              name: 'Squeeze',
              args: [{ log: '*', response: '*', request: '*', error: '*' }]
            }, {
              module: 'white-out',
              args: [{
                password: 'remove',
                newPassword: 'remove',
                confirmpassword: 'remove',
                confirmNewPassword: 'remove'
              }]
            }, {
              module: '@hapi/good-console'
            }, 'stdout']
          }
        }
      }
    ]
  }
};
