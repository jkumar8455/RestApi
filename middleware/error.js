const Errorhandler=require("../utils/errorhandler");


module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.message=err.message || "internal server error";
    //mongodbid error
    if(err.name==="CastError"){
        const message=`resource not found invalid:${err.path}`;
        err.message=message;
    }
    //mongodb duplicatekey error
    if(err.code===11000){
        const message=`duplicate ${Object.keys(err.keyValue)} entered`;
        err.message=message;
    };
    //jsonwebtoken error
    if(err.name==="JsonWebTokenError"){
        const message=`jsonwebtoken is invalid`;
        err.message=message;
    }
    //jwt expire error
    if(err.name==="TokenExpireError"){
        const message=`token has been expired`;
        err.message=message;
    };
    res.status(err.statusCode).json({
        success:false,
        message:err.message,
    })
}