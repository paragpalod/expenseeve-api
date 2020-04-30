// these are developer users used to login in to swagger
const users = {
  paragpalod: {
    id: '1',
    name: 'Parag Palod',
    password: 'developer#123'
  }
};

exports.plugin = {
  name: 'developerauth',
  register: function (server) {
    server.auth.strategy('developer', 'basic', {
      validate: async (request, username, password) => {
        const user = users[username];
        if (!user) {
          return { credentials: null, isValid: false };
        }

        if (password === user.password) {
          const credentials = { id: user.id, name: user.name };
          return { isValid: true, credentials };
        }
      }
    });
  }
};
