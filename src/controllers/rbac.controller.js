"use strict";
const RbacService = require("../services/rbac.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

class RbacController {
  createNewRole = async (req, res, next) => {
    new CREATED({
      message: "Create new role success",
      metadata: await RbacService.createRole(req.body),
    }).send(res);
  };

  createNewResource = async (req, res, next) => {
    new CREATED({
      message: "Create new resource success",
      metadata: await RbacService.createResource(req.body),
    }).send(res);
  };

  getRoleList = async (req, res, next) => {
    new SuccessResponse({
      message: "Get role list success",
      metadata: await RbacService.roleList(req.body),
    }).send(res);
  };

  getResourceList = async (req, res, next) => {
    new SuccessResponse({
      message: "Get resource list success",
      metadata: await RbacService.resourceList(req.body),
    }).send(res);
  };
}

module.exports = new RbacController();
