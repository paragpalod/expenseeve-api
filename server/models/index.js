const fs = require('fs');
const path = require('path');
const basename = path.basename(module.filename);
const mongoose = require('mongoose');
const Files = [];
const db = {};

// importing all the files from all the folders in current directory
fs
  .readdirSync(__dirname).filter(dir => dir !== basename)
  .map(file => {
    fs
      .readdirSync(path.join(__dirname, file))
      .map(f => Files.push({ name: f, path: path.join(__dirname, file) }));
  });

// Set values for debug to log the every query on terminal
mongoose.set('debug', true);

/*
Create a mongoose connection to connect to the database.currently using local mongo instance
you have to install mongo on your machine to connecct to database otherwise add your
mongo atlas databse url in your envirnoment variable
*/
const Connection = mongoose.createConnection(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
);

// Creating mongoose Models from importes files
Files
  .filter(file => (file.name.indexOf('.') !== 0) && (file.name.slice(-3) === '.js'))
  .map(file => {
    return {
      model: require(path.join(file.path, file.name))(mongoose.Schema),
      modelName: file.name.substr(0, file.name.length - 3)
    };
  })
  .map(file => {
    db[file.modelName] = Connection.model(file.modelName, file.model);
  });

// if there is issue with connection to database
Connection.on('error', (err) => {
  console.log('Database Connection error.', err);
});

// Connection successful to the database
Connection.once('open', () => {
  // if you want to do something after databse connection is created
});

module.exports = db;
