const mongoose = require('mongoose');

const review = new mongoose.Schema({
  mid: String,
    // pid: String,
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
    review_photo: String,
    rid: String,
    username: String
});
const productSchema = new mongoose.Schema({
  pid: { type: String, unique: true, required: true },
  product_name: String,
  desc: String,
  fit:String,
  discount: String,
  discount_date: {
    end: String,
    start: String,
  },
  discount_type: String,
  gallery_images: [{buffer: Buffer,
    url: String,}],
  category: String,
  sub_category: String,
  selling_price: String,
  quantity_pi: Number,
  reward_points: String,
  sku: String,
  sales:  { type: Number, default: 0 },
  tags: String,
  thumbnail_image:  {
    buffer: Buffer,
    url: String,

  },
  unit: String,
  unit_price: Number,
  variantEnabled: { type: Boolean, default: true }, 
  product_desc: String,
  colors: [],
  variants: [],
  size:[],
  shipping_returns:String,
  fabric:String,
  about:String,
  refund:String,
  rating:{type:String,default:"0"},
  draft:String,
  product_detail:String,
  SEOArea: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    images: Buffer,
    images1: String,
  },  
   data: {
    review: { type: [review], default: [] }, // default value set to an empty array
    average_rating:  { type: Number, default: 0 },
        total_reviews:  { type: Number, default: 0 },
},
});

module.exports = mongoose.model('Product', productSchema);
