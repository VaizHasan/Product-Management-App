const express = require("express");
const productController = require("../controller/productControllers");

const router = express.Router();

router.route("/").get(productController.listProducts).post(productController.validateProduct, productController.createProduct);
router.route("/:id").get(productController.getProduct).put(productController.validateProduct, productController.updateProduct).delete(productController.deleteProduct);

module.exports = router;