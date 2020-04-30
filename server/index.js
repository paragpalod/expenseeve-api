require('dotenv').config();// comment this while deploying to production
const Glue = require('@hapi/glue');
const { manifest } = require('./config/server');

const startServer = async function () {
  try {
    const server = await Glue.compose(manifest, { relativeTo: __dirname });
    await server.start();
    console.log('Server is listening on ' + server.info.uri.toLowerCase());
  } catch (Exception) {
    console.log('server.register Exception:', Exception);
    process.exit(1);
  }
};

startServer();
