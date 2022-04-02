const bcryptjs = require("bcryptjs");
const mongoose =require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter your name"],
        maxlength:[30,"name can't exceed 30 character"],
        minlength:[5,"name must have at least 5 characters"],
    },
    email:{
        type:String,
        required:[true,"please enter your email"],
        validate:[validator.isEmail,"please enter a valid email"],
        unique:true,
    },
    password:{
        type:String,
        select:false,
        required:[true,"please enter your password"],
        minlength:[8,"password must have at least 8 character"],
        maxlength:[30,"password can't exceed 30 characters"],
    },
    avatar:{
        publicId:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    role:{
        type:String,
        default:"user",
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

//PASSWORD HASHING
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
});
//JWT TOKEN
userSchema.methods.getJWTToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
}
//generating resetpasswordtoken
userSchema.methods.getResetPasswordToken=function(){

    const resetToken=crypto.randomBytes(20).toString('hex');
    //hashing and adding to userschema
    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire=Date.now()+15*60*1000;
    return resetToken;
}
userSchema.methods.comparePassword=async function(enteredpassword){
    return await bcrypt.compare(enteredpassword,this.password);
}

module.exports=mongoose.model("User",userSchema);