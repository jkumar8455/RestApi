const catchasyncerror = require("../middleware/catchasyncerror");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Errorhandler = require("../utils/errorhandler");

exports.createNewOrder = catchasyncerror(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new Errorhandler("please select a vaid product to place the order", 404)
    );
  }
  if(product.stock===0){
    return next(new Errorhandler("out of sail",404));
  }
  quantity = req.body.quantity || 1;
  if (quantity > product.stock) {
    return next(
      new Errorhandler(`only ${product.stock} quantity is availavle`, 401)
    );
  }
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
  const items = {
    name: product.name,
    image: product.image[0].url,
    price: product.price,
    quantity: quantity,
    Product: req.params.id,
  };
  let order = await Order.findOne({ user: req.user._id });
  if (order) {
    let isfound = false;
    order.orderItems.forEach((e) => {
      if (e.Product.toString() === req.params.id.toString()) {
        isfound = true;
        e.quantity += quantity;
      }
    });
    if (!isfound)
    order.orderItems.push(items);
    await order.save({validateBeforeSave:false});
  } else {
    const {
      shippingInfo,
      paymentInfo,
      taxPrice,
      shippingPrice,
      itemPrice,
      totalPrice,
    } = req.body;
    order = await Order.create({
      shippingInfo,
      paymentInfo,
      orderItems: items,
      itemPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
  }
  res.status(200).json({
    success: true,
    message: "order placed successfully",
    order,
  });
});

exports.myOrders=catchasyncerror(async(req,res,next)=>{
  const order=await Order.findOne({user:req.user._id});
  if(!order){
    return next(new Errorhandler("No order found",404));
  }
  res.status(200).json({
    success:true,
    orderList:order.orderItems,
  })
});

//getAllOrders-- Admin
exports.getAllorders=catchasyncerror(async(req,res,next)=>{
  const order=await Order.find();
  let total=0;
  order.forEach(item=>{
    item.orderItems.forEach(e=>{
      total+=e.price*e.quantity;
    })
  })
  res.status(200).json({
    success:true,
    total,
    order,
  })
});

//getSingleOrder--Admin
exports.getSingleOrder=catchasyncerror(async(req,res,next)=>{
  const order=await Order.findById(req.params.id).populate("user","email");
  if(!order){
    return next(new Errorhandler("no product found",404));
  }
  res.status(200).json({
    success:false,
    order,
  })
})

//cancelOrder
exports.cancelOrder=catchasyncerror(async(req,res,next)=>{
  let order=await Order.findOne({user:req.user._id});
  if(!order){
    return next(new Errorhandler("order not found",404));
  }
  let quantity=req.body.quantity || 10000;
  let isfound=false;
  order.orderItems.forEach(e=>{
    if(e.Product.toString()===req.params.id){
      quantity=Math.min(quantity,e.quantity);
      e.quantity-=quantity;
      isfound=true;
    }
  })
  if(!isfound){
    return next(new Errorhandler("order does not exist with this id",404));
  }
  const new_order=order.orderItems.filter(e=>{
    return e.quantity>0;
  });
  order.orderItems=new_order;
  if(new_order.length===0) await order.remove();
  else await order.save({validateBeforeSave:false});
  const product=await Product.findById(req.params.id);
  product.stock+=quantity;
  product.save({validateBeforeSave:false});
  res.status(200).json({
    success:true,
  })
});

//updateOrderStatus -- Admin
exports.updateOrderStatus=catchasyncerror(async(req,res,next)=>{
  const order=await Order.findById(req.params.id);
  if(!order){
    return next(new Errorhandler("no order found",404));
  }
  if(order.orderStatus==="Delivered"){
    if(order.deliveredAt+2*24*60*60*1000<Date.now()){
      await order.remove();
    }
    else{
      return next(new Errorhandler("order has beed delivered already",400));
    }
  }
  const status=req.body.status || order.orderStatus;
  order.orderStatus=status;
  if(status==="Delivered"){
    order.deliveredAt=Date.now();
  };
  await order.save({validateBeforeSave:false});
  res.status(200).json({
    success:true,
  })
})