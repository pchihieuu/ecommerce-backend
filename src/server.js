const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");

const port = process.env.DEV_APP_PORT || 3056;

const server = app.listen(port, () => {
  console.log(`Server start with ${port}`);
});

module.exports = server;
