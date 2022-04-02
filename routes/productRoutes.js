const express=require("express");
const { getAllProuduct, createProduct, updateProduct, deleteProduct, getSingleProductDetails, addOrUpdateReview, deleteReviews, getAllReviews } = require("../controllers/productController");
const { isAuthenticated, isAuthorized } = require("../middleware/auth");
const router=express.Router();

router.route("/product").get( getAllProuduct);
router.route("/admin/product/new").post(isAuthenticated,isAuthorized("admin"),createProduct);
router.route("/admin/product/:id").put(isAuthenticated,isAuthorized("admin"),updateProduct).delete(isAuthenticated,isAuthorized("admin"),deleteProduct);
router.route("/product/:id").get(getSingleProductDetails);
router.route("/product/review/add").put(isAuthenticated, addOrUpdateReview);
router.route("/product/review/:id").get(getAllReviews).delete(isAuthenticated,deleteReviews);
module.exports=router;