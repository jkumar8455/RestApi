const Errorhandler = require("../utils/errorhandler");
const catchasyncerror = require("./catchasyncerror");
const User=require("../models/userModel")
const jwt=require("jsonwebtoken");
exports.isAuthenticated=catchasyncerror(async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return next(new Errorhandler("please login to access this feature",400));
    }
    const decodeddata=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decodeddata.id);
    next();
});

exports.isAuthorized=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new Errorhandler(`role:${req.user.role} is not allowed to perform this action`,403));
        }
        next();
    }
}