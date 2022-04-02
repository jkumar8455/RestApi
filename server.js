const app=require("./app");
const dotenv=require("dotenv");
const connectdatabase = require("./database");

//handling uncaught exception
process.on("uncaughtException",err=>{
    console.log(`message:${err.message}`);
    console.log("shutting down the server due to uncaughtexception");
    process.exit(1);
})
dotenv.config({path:"backend/Config/config.env"});
connectdatabase();
const server=app.listen(process.env.PORT,()=>{
    console.log(`server is running at http://localhost:${process.env.PORT}`)
});

//unhandled promise rejection
process.on("unhandledRejection",err=>{
    console.log(`message:${err.message}`);
    console.log("shutting down the server due to unhandles promise rejection");
    server.close(()=>{
        process.exit(1);
    });
})