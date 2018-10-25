require('dotenv').config({path: 'variables.env'});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TO DO: use express middleware to handle cookies and populate current user

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
}, details => {
  console.log(`Server is now running on port ${details.port}`)
});