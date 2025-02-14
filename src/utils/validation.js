"use strict";

const { BadRequestRespone } = require("../core/error.respone");

class ValidationUtils {
  static validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static validateSignUpData({ email, password }) {
    const errors = [];

    if (!this.validateEmail(email)) {
      errors.push("Invalid email format");
    }

    if (!this.validatePassword(password)) {
      errors.push(
        "Password must be least 8 characters long and contain uppercase, lowercase and numeric characters")
    }

    if (errors.length > 0) {
      throw new BadRequestRespone(errors.join(", "));
    }
  }
}

module.exports = {ValidationUtils};