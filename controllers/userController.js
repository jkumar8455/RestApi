const catchasyncerror = require("../middleware/catchasyncerror");
const User = require("../models/userModel");
const Errorhandler = require("../utils/errorhandler");
const sendToken = require("../utils/jwttoken");
const { sendEmail } = require("../utils/sendEmail");
const crypto =require("crypto");
///register user
exports.registerUser = catchasyncerror(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      publicId: "sampleId",
      url: "profilepicurl",
    },
  });
  sendToken(user, 201, res);
});

//login user
exports.loginUser = catchasyncerror(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new Errorhandler("please enter both email or password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new Errorhandler("inavlid email or password", 401));
  }
  const ispasswordmatched = await user.comparePassword(password);
  if (!ispasswordmatched) {
    return next(new Errorhandler("invalid email or password", 401));
  }
  sendToken(user, 200, res);
});

//logoutUser
exports.logoutUser = catchasyncerror(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    mesage: "logged out successfully",
  });
});

//FORGOT PASSWORD
exports.forgotPassword = catchasyncerror(async (req, res, next) => {
  email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `your reset password token is \n\n${resetPasswordUrl} \n\nif you did not request for this, please ignore it`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce password recovery",
      message,
    });
    res.status(200).json({
      success: false,
      mesage: "email has been sent successfully",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new Errorhandler(error.message, 500));
  }
});

//RESET PASSWORD
exports.resetPassword=catchasyncerror(async(req,res,next)=>{
  const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest('hex');

  const user=await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()},
  })
  if(!user){
    return next(new Errorhandler("resetPasswordToken is invalid or has been expired",400));
  }
  if(req.body.password!==req.body.confirmPassword){
    return next(new Errorhandler("password does not match",400));
  }
  user.password=req.body.password;
  user.resetPasswordToken=undefined;
  user.resetPasswordExpire=undefined;
  await user.save({validateBeforeSave:false});
  sendToken(user,200,res);
});

//getUserDeatils
exports.getUserDetails=catchasyncerror(async(req,res,next)=>{
  const user=req.user;
  res.status(200).json({
    success:true,
    user,
  })
})

//UPDATE PASSWORD
exports.updatePassword=catchasyncerror(async(req,res,next)=>{
  const user=await User.findById(req.user.id).select("+password");
  const oldPassword=req.body.oldPassword;
  const newPassword=req.body.newPassword;
  const confirmPassword=req.body.confirmPassword;
  if(!oldPassword){
    return next(new Errorhandler("please enter your oldPassword",400));
  };
  if(!newPassword || !confirmPassword){
    return next(new Errorhandler("please enter both newPassword and confirPassword",400));
  }
  if(newPassword!==confirmPassword){
    return next(new Errorhandler("newPassword and confirmPassword is differnt",400))
  };
  const ispasswordmatched=await user.comparePassword(oldPassword);
  if(!ispasswordmatched){
    return next(new Errorhandler("old password is incorrect",401));
  };
  user.password=newPassword;
  await user.save({validateBeforeSave:false});
  res.status(200).json({
    success:true,
    message:"password has been updated successfully",
  });
});

//update userprofile
exports.updateProfile=catchasyncerror(async(req,res,next)=>{
  const userData={
    name:req.body.name,
    email:req.body.email,
  };
  const user=await User.findByIdAndUpdate(req.user.id,userData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });
  res.status(200).json({
    success:false,
    message:"updated successfully",
  })
})

//getAllUser --Admin
exports.getAllUser=catchasyncerror(async(req,res,next)=>{
  const user=await User.find();
  res.status(200).json({
    success:true,
    user,
  });
})
//getSingleUser -- Admin
exports.getSingleUser=catchasyncerror(async(req,res,next)=>{
  const user=await User.findById(req.params.id);
  if(!user){
    return next(new Errorhandler("user does not exists",401));
  }
  res.status(200).json({
    success:true,
    user,
  });
})

//changeUserRole
exports.changeUserRole=catchasyncerror(async(req,res,next)=>{
  const user=await User.findById(req.params.id);
  if(!user){
    return next(new Errorhandler("user not found",404));
  }
  user.role=req.body.role;
  await user.save({validateBeforeSave:false});
  res.status(200).json({
    success:true,
    message:"role has been changed successfully",
  })
})

//deleteUser
exports.deleteUser=catchasyncerror(async(req,res,next)=>{
  const user=await User.findById(req.params.id);
  if(!user){
    return next(new Errorhandler("user does not exists",404));
  }
  await user.remove();
  res.status(200).json({
    success:true,
    message:"user has been deleted successfully",
  });
})