"use strict";

const mongoose = require("mongoose");

require("dotenv").config();
const {
  db: { port, host, name },
} = require("../configs/database.js");
const { countConnect, checkOverload } = require("../helpers/check.connect");
const connectString = `mongodb://${host}:${port}/${name}`;
console.log(connectString);
class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString)
      .then((_) => {
        console.log("Connect mongodb success");
        countConnect();

        checkOverload();
      })
      .catch((err) => console.log(`Error connect`, err.message));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
