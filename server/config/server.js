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
        plugin: './authStrategy/auth'
      },
      {
        plugin: './routes',
        routes: { prefix: '/api' }
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
