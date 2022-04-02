const catchasyncerror = require("../middleware/catchasyncerror");
const Product=require("../models/productModel");
const Errorhandler = require("../utils/errorhandler");
const Apifeatures=require("../utils/apifeatures")
//create Product
exports.createProduct=catchasyncerror(async(req,res,next)=>{
    req.body.user=req.user._id;
    const product=await Product.create(req.body);
    res.status(200).json({
        success:true,
        product,
    })
});
//getAll Product
exports.getAllProuduct=catchasyncerror(async(req,res,next)=>{
    const resultperpage=3;
    const countdocument=await Product.countDocuments();
    const apifeature=new Apifeatures(Product.find(),req.query).search().filter().pagination(resultperpage);
    const product=await apifeature.query;
    res.status(200).json({
        success:true,
        countdocument,
        product,
    });

});

//updateProduct
exports.updateProduct=catchasyncerror(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhandler("product not found",500));
    };
    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runvalidators:true,
        useFindAndModify:false,
    });
    res.status(200).json({
        success:true,
        product,
    })
});

//deleteProduct
exports.deleteProduct=catchasyncerror(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhandler("product not found",500));
    }
    await product.remove();
    res.status(200).json({
        success:true,
        message:"product deleted successfully",
    })
})

//getSingleProductDetails
exports.getSingleProductDetails=catchasyncerror(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhandler("product not found",500));
    }
    res.status(200).json({
        success:true,
        product
    })
});

//add or update product review
exports.addOrUpdateReview=catchasyncerror(async(req,res,next)=>{
    const {rating,comment,productId}=req.body;
    let isreviewed=false;
    const product=await Product.findById(productId);
    if(!product){
        return next(new Errorhandler("Product not found",404));
    }
    product.reviews.forEach(rev=>{
        if(rev.email===req.user.email){
            rev.rating=Number(rating);
            rev.comment=comment;
            isreviewed=true;
        }
    })
    if(!isreviewed){
        const review={
            name:req.user.name,
            email:req.user.email,
            rating,
            comment,
        }
        product.reviews.push(review);
        product.numOfReviews=product.reviews.length;
    }
    if(product.numOfReviews===0){
        product.ratings=0;
    }
    else{
        let avg=0;
        product.reviews.forEach(rev=>{
            avg+=rev.rating;
        })
        product.ratings=avg/product.numOfReviews;
    }
    await product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
    })
});
//deleteReview
exports.deleteReviews=catchasyncerror(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhandler("product not found",404));
    }
    const review=product.reviews.filter(rev=>{
        return rev.email!==req.user.email;
    })
    product.reviews=review;
    product.numOfReviews=product.reviews.length;
    if(product.numOfReviews===0){
        product.ratings=0;
    }
    else{
        let avg=0;
        product.reviews.forEach(rev=>{
            avg+=rev.rating;
        })
        product.ratings=avg/product.numOfReviews;
    }
    product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
    })
});

exports.getAllReviews=catchasyncerror(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new Errorhandler("product not found",404));
    }
    const reviews=product.reviews;
    res.status(200).json({
        success:true,
        totalreviews:product.numOfReviews,
        ratings:product.ratings,
        reviews,
    })
})