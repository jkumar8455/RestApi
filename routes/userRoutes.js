const express=require("express");
const { registerUser, loginUser, logoutUser, forgotPassword, updatePassword, resetPassword, getUserDetails, updateProfile, getAllUser, getSingleUser, changeUserRole, deleteUser } = require("../controllers/userController");
const { isAuthenticated, isAuthorized } = require("../middleware/auth");
const router=express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticated, getUserDetails);
router.route("/password/update").put(isAuthenticated,updatePassword);
router.route("/me/update").put(isAuthenticated,updateProfile);
router.route("/admin/users").get(isAuthenticated,isAuthorized("admin"), getAllUser);
router.route("/admin/user/:id").get(getSingleUser);
router.route("/admin/role/:id").put(isAuthenticated,isAuthorized("admin"),changeUserRole).delete(isAuthenticated,isAuthorized("admin"),deleteUser);
module.exports=router;