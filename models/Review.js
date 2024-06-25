// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    mid: String,
    pid: String,
    product_name: String,
    rating: Number,
    review: String,
    location:String,
    Age:Number,
    Height:Number,
    BodyType:String,
    FitPurchased:String,
    SizePurchased:String,
    SizeWorn:String,
    review_photo: {
        images:{
            String
        }
    },
    rid: String,
    username: String
});

module.exports = mongoose.model('Review', reviewSchema);
