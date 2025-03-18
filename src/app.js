const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
// const { checkOverload } = require("./helpers/check.connect");
const { corsMiddleware, pushToLogDiscord } = require("./middlewares");
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
app.use(corsMiddleware);
app.use(pushToLogDiscord);

// test redis
require("./tests/inventory.test");
const productTest = require("./tests/product.test");
productTest.purchaseProduct("productId:001", 10);

// intit db
require("./db/mongodb");

// init routes
app.use("/", require("./routes"));

// hander error

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "API is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

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
