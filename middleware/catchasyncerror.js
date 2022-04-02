module.exports=catcherror=>(req,res,next)=>{
    Promise.resolve(catcherror(req,res,next)).catch(next);
}