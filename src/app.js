const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const { v4: uuidv4 } = require("uuid");
const mylogger = require("./loggers/mylogger.log");
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

// init logger - info of request
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.requestId = requestId;
  mylogger.log(`Input params :: ${req.method}`, [
    req.path,
    { requestId: req.requestId },
    req.method === "POST" ? req.body : req.query,
  ]);
  next();
});
app.use(corsMiddleware);
app.use(pushToLogDiscord);

// test redis
require("./tests/inventory.test");
const productTest = require("./tests/product.test");
productTest.purchaseProduct("productId:001", 10);

// intit db
require("./db/init.mongodb");
require("./db/init.redis");
// init routes
app.use("/", require("./routes"));

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const resMessage = `${statusCode} - ${Date.now()} - Response - ${JSON.stringify(
    err
  )}`;
  try {
    mylogger.error(`[${statusCode}] - ${err.message}`, [
      req.path || "unknown path",
      { requestId: req.requestId || uuidv4() },
      { message: resMessage },
    ]);
  } catch (logError) {
    console.error("Logger error:", logError);
  }

  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
