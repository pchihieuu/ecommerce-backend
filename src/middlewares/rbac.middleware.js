"use strict";
const { AuthFailureResponse } = require("../core/error.response");
const rbac = require("./role.middleware");
const RbacService = require("../services/rbac.service");
/**
 *
 * @param {string} action // read, delete, update, create
 * @param {*} resource  // profile, balance
 * @returns
 */

const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      rbac.setGrants(
        await RbacService.roleList({
          userId: req.user.userId,
        })
      );
      const role_name = req.query.role;
      const permission = await rbac.can(role_name)[action](resource);
      if (!permission.granted) {
        throw new AuthFailureResponse("You are not allowed to do this action");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
module.exports = {
  grantAccess,
};
