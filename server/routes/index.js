const fs = require('fs');
const path = require('path');
const models = [];

fs.readdirSync(path.join(__dirname, 'api')).map(dir => {
  fs
    .readdirSync(path.join(__dirname, 'api', dir))
    .filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))
    .map(file => require(path.join(__dirname, 'api', dir, file)).routes)
    .filter(file => file !== undefined)
    .map(routes => routes.map(route => models.push(route)));
});

exports.plugin = {
  name: 'api',
  register: server => server.route(models)
};
