"use strict";

const { model, Schema, default: mongoose } = require("mongoose");

const DOCUMENT_NAME = "Role";
const COLLECTION_NAME = "Roles";

const RoleSchema = new Schema(
  {
    role_name: {
      type: String,
      required: true,
      enum: ["admin", "user", "shop"],
    },
    role_slug: {
      type: String,
      required: true,
    },
    role_status: {
      type: String,
      enum: ["active", "inactive", "blocked", "pending"],
      default: "active",
    },
    role_grants: {
      type: [
        {
          resource_id: {
            type: Schema.Types.ObjectId,
            ref: "Resource",
            required: true,
          },
          actions: {
            type: String,
            required: true,
          },
          attributes: {
            type: String,
            default: "*",
          },
        },
      ],
      required: true,
    },
    role_description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const Role = mongoose.model(DOCUMENT_NAME, RoleSchema);

module.exports = Role;
