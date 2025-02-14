"use strict";

const StatusCode = {
  FORBIDEN: 403,
  CONFLICT: 400,
};
const MessageRespone = {
  FORBIDEN: "Bad Request",
  CONFLICT: "Conflict Error",
};
class ErrorRespone extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRespone extends ErrorRespone {
  constructor(
    message = MessageRespone.CONFLICT,
    statusCode = StatusCode.CONFLICT
  ) {
    super(message, statusCode);
  }
}
class BadRequestRespone extends ErrorRespone {
  constructor(
    message = MessageRespone.FORBIDEN,
    statusCode = StatusCode.FORBIDEN
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ConflictRespone,
  BadRequestRespone,
};
