"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;
// count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number connections::${numConnection}`);
};

// check over load
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCore = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    // Example
    const maxConnection = numCore * 5;

    console.log(`Active connection:: ${numConnection}`);
    console.log(`Memory usage::${memoryUsage / 1024 / 1024} MB`);

    if (numConnection > maxConnection) {
      console.log(`Connect overload detected`);
    }
  }, _SECONDS);
};

module.exports = {
  countConnect,
  checkOverload,
};
