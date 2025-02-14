'use strict'

const StatusCode = {
  OK: 200,
  CREATED: 201
}

const ReasonStatusCode = {
  OK: 'Success',
  CREATED: 'Created!'
}

class SuccessResponse {
  static send(res, {
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
    headers = {}
  }) {
    const responseData = {
      message: message || reasonStatusCode,
      status: statusCode,
      metadata
    }

    if (Object.keys(headers).length) {
      Object.keys(headers).forEach(key => {
        res.setHeader(key, headers[key])
      })
    }
    
    return res.status(statusCode).json(responseData)
  }
}

class OK extends SuccessResponse {
  static send(res, { message, metadata }) {
    return super.send(res, { message, metadata })
  }
}

class CREATED extends SuccessResponse {
  static send(res, { message, metadata, options = {} }) {
    return super.send(res, {
      message,
      statusCode: StatusCode.CREATED,
      reasonStatusCode: ReasonStatusCode.CREATED,
      metadata,
      headers: options
    })
  }
}

module.exports = {
  OK,
  CREATED
}