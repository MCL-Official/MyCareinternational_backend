const mongoose=require("mongoose")

const cartSchema=new mongoose.Schema({
    uid:String,
    cartsPid:[]
})

module.exports=mongoose.model("cartProdcut",cartSchema)