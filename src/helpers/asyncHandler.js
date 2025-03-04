"use strict";

const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Ensure fn is a function before calling
    if (typeof fn !== "function") {
      return next(new Error("Handler is not a function"));
    }

    // Use Promise.resolve to handle both async and sync functions
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { asyncHandler };
