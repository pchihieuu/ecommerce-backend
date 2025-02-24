// "use strict";

// const express = require("express");
// const router = express.Router();
// const { asyncHandler } = require("../../helpers/asyncHandler");

// const discountController = require("../../controllers/discount.controller");
// const { authentication, authenticationV2 } = require("../../auth/authUtils");

// router.get(
//   "/get-discount-amount",
//   asyncHandler(discountController.getDiscountAmount)
// );
// router.get(
//   "/get-products-by-discount/:code/:shopId",
//   asyncHandler(discountController.getProductsByDiscount)
// );

// // authentication
// router.use(authenticationV2);
// // create product
// router.post("/create", asyncHandler(discountController.createDiscountCode));
// router.post("/delete", asyncHandler(discountController.deleteDiscount));
// router.patch("/cancel", asyncHandler(discountController.cancelDiscount));

// router.get(
//   "/get-all-discounts-by-shop",
//   asyncHandler(discountController.getAllDiscountCodeByShop)
// );
// router.get(
//   "/get-all-discounts-by-shop",
//   asyncHandler(discountController.getAllDiscountCodeByShop)
// );
// router.patch("/update", asyncHandler(discountController.updateDiscount));
// // router.get(
// //   "/published/all",
// //   asyncHandler(productController.getAllPublishedProducts)
// // );
// // router.patch("/:product_id", asyncHandler(productController.updateProduct));

// module.exports = router;

"use strict";

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/list_product_code",
  asyncHandler(discountController.getAllDiscountCodeWithProducts)
);

router.post("/amount", asyncHandler(discountController.getDiscountAmount));

router.use(authenticationV2);

router.post("/create", asyncHandler(discountController.createDiscountCode));
router.get("/get-all", asyncHandler(discountController.getAllDiscountCodes));
router.post("/delete", asyncHandler(discountController.deleteDiscount));
router.patch("/cancel", asyncHandler(discountController.cancelDiscount));
router.patch("/update", asyncHandler(discountController.updateDiscount));

module.exports = router;
