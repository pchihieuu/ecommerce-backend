const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");

const port = process.env.DEV_APP_PORT || 3056;

const server = app.listen(port, () => {
  console.log(`Server start with ${port}`);
});
