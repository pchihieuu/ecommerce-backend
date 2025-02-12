const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
// const { checkOverload } = require("./helpers/check.connect");

const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// intit db
require("./db/mongodb");
// checkOverload();

// init routes
app.use("/", require("./routes"));

module.exports = app;
