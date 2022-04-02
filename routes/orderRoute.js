const express=require("express");
const { createNewOrder, myOrders, getAllorders, getSingleOrder, cancelOrder, updateOrderStatus } = require("../controllers/orderController");
const { isAuthenticated, isAuthorized } = require("../middleware/auth");
const router=express.Router();

router.route("/order/:id").post(isAuthenticated,createNewOrder);
router.route("/order/me").get(isAuthenticated,myOrders);
router.route("/admin/orders").get(isAuthenticated,isAuthorized("admin"),getAllorders);
router.route("/admin/order/:id").get(isAuthenticated,isAuthorized("admin"),getSingleOrder).put(isAuthenticated,isAuthorized("admin"),updateOrderStatus);
router.route("/order/cancel/:id").put(isAuthenticated,cancelOrder);
module.exports=router;