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

// test redis
require("./tests/inventory.test");
const productTest = require("./tests/product.test");
productTest.purchaseProduct("productId:001", 10);

// intit db
require("./db/mongodb");

// init routes
app.use("/", require("./routes"));

// hander error

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: err.stack,
    message: err.message || "Internal Server Error",
  });
});
module.exports = app;
