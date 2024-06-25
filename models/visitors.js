const mongoose=require("mongoose")
const messageSchema = new mongoose.Schema({
    ip:String,
    country:String,
    date:String
});

module.exports=mongoose.model("visitors",messageSchema)