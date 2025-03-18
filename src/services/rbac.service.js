"use strict";

const Resource = require("../models/resource.model");
const { BadRequestResponse } = require("../core/error.response");
const Role = require("../models/role.model");

class RbacService {
  static async createResource({
    resource_name = "profile",
    resource_slug = "p000001",
    resource_description = "profile description",
  }) {
    try {
      const foundResource = await Resource.findOne({ resource_slug });
      if (foundResource) {
        throw new BadRequestResponse("Resource already exists");
      }

      const newResource = await Resource.create({
        resource_name,
        resource_slug,
        resource_description,
      });

      return newResource;
    } catch (error) {
      throw new BadRequestResponse(error.message);
    }
  }

  static async resourceList({
    userId = 0,
    limit = 30,
    offset = 0,
    search = "",
  }) {
    try {
      const resources = await Resource.aggregate([
        {
          $project: {
            _id: 0,
            resource_name: "$resource_name",
            resource_slug: "$resource_slug",
            resource_description: "$resource_description",
            resourceId: "$_id",
            createdAt: 1,
          },
        },
      ]);
      return resources;
    } catch (error) {
      throw new BadRequestResponse(error.message);
    }
  }

  static async createRole({
    role_name = "admin",
    role_slug = "r000001",
    role_description = "admin description",
    role_grants = [],
  }) {
    try {
      const foundRole = await Role.findOne({ role_slug });
      if (foundRole) {
        throw new BadRequestResponse("Role already exists");
      }

      const newRole = await Role.create({
        role_name,
        role_slug,
        role_description,
        role_grants,
      });

      return newRole;
    } catch (error) {
      throw new BadRequestResponse(error.message);
    }
  }

  static async roleList({ userId = 0, limit = 30, offset = 0, search = "" }) {
    try {
      const roles = await Role.aggregate([
        {
          $unwind: "$role_grants",
        },
        {
          $lookup: {
            from: "Resources",
            localField: "role_grants.resource_id",
            foreignField: "_id",
            as: "resource",
          },
        },
        {
          $unwind: "$resource",
        },
        {
          $project: {
            role: "$role_name",
            resource: "$resource.resource_name",
            action: "$role_grants.actions",
            attributes: "$role_grants.attributes",
          },
        },
        {
          $project: {
            _id: 0,
            role: 1,
            resource: 1,
            action: 1,
            attributes: 1,
          },
        },
      ]);

      return roles;
    } catch (error) {
      console.error("Error in roleList:", error);
      throw new BadRequestResponse(error.message);
    }
  }
}

module.exports = RbacService;
