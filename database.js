const mongoose=require("mongoose");

const connectdatabase=()=>{
    mongoose.connect(process.env.DB_URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }).then((data)=>{
        console.log(`mongodb connected to server : ${data.connection.host}`);
    });
}

module.exports=connectdatabase;