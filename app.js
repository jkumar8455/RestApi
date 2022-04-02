const express=require("express");
const app=express();
const errormiddleware=require("./middleware/error");
const cookieParser=require("cookie-parser");
app.use(express.json());
app.use(cookieParser());
//importing routes
const prouduct=require("./routes/productRoutes");
const user=require("./routes/userRoutes");
const order=require("./routes/orderRoute");
app.use("/api/v1",prouduct);
app.use("/api/v1",user);
app.use("/api/v1",order);

//middleware error
app.use(errormiddleware);
module.exports=app;

