"use strict";
const myloggerLog = require("../loggers/mylogger.log");
const StatusCode = {
  FORBIDEN: 403,
  CONFLICT: 400,
  NOT_FOUND: 404,
};
const MessageResponse = {
  FORBIDEN: "Bad Request",
  CONFLICT: "Conflict Error",
};

const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;

    myloggerLog.error(`[${this.status}] - ${this.message}`, {
      context: "/path",
      requestId: "ID_REQUEST",
      metadata: {
        message: this.message,
        status: this.status,
      },
    });
  }
}

class ConflictResponse extends ErrorResponse {
  constructor(
    message = MessageResponse.CONFLICT,
    statusCode = StatusCode.CONFLICT
  ) {
    super(message, statusCode);
  }
}
class BadRequestResponse extends ErrorResponse {
  constructor(
    message = MessageResponse.FORBIDEN,
    statusCode = StatusCode.FORBIDEN
  ) {
    super(message, statusCode);
  }
}

class AuthFailureResponse extends ErrorResponse {
  constructor(
    message = ReasonPhrases.UNAUTHORIZED,
    statusCode = StatusCodes.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

class NotFoundResponse extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    statusCode = StatusCode.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}
class ForbiddenResponse extends ErrorResponse {
  constructor(
    message = ReasonPhrases.FORBIDDEN,
    statusCode = StatusCodes.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}
module.exports = {
  ConflictResponse,
  BadRequestResponse,
  AuthFailureResponse,
  NotFoundResponse,
  ForbiddenResponse,
};
