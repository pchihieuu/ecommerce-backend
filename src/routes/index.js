"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
const router = express.Router();

// check api key
router.use(apiKey);

// check permission
router.use(permission("0000"));

router.use("/v1/api", require("./access"));

module.exports = router;

// "use strict";

// const express = require("express");
// const { apiKey, permission } = require("../auth/checkAuth");
// const router = express.Router();

// // Check API key for all routes
// router.use(apiKey);

// // Add shop routes with permission check
// router.use("/v1/api/shop", permission("0000"), require("./access"));

// // Add other routes without permission check if needed
// router.use("/v1/api", require("./access"));

// module.exports = router;
