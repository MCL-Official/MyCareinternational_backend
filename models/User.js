const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    date: String,
    time: String,
    msg_id: String,
    msg: String,
    readed: Boolean,
    sender_uid: String,
    // reciver_uid: String,
    sender_uname: String,
});

const addressSchema = new mongoose.Schema({

    country: String,
    landmark: String,
    zipcode: String,
    phone_no: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number,
    defaultAddress: { type: Boolean}, 
    addressSelected: { type: Boolean} 
});
const cartschema = new mongoose.Schema({
    name:String,
    pid:String,
    Quantity:Number,
    Size:String,
    Colour:String,
    price:Number,
    url:String

});


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    mobileNo: { type: String, required: true },
    mid: { type: String, unique: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    payment_history: { type: Number, default: 0 },
    purchased_items: { type: Number ,default: 0},
    reward_points: { type: Number ,default: 0},
    cashback_points: { type: Number ,default: 0},
    pic_url: { type: String },
    auth_code: { type: String },
    // address: { type: String },
    bio: { type: String },
    birth_date: { type: Date },
    
    fname: { type: String },
    gender: { type: String },
    lname: { type: String },
    phn: { type: String },
    rating: { type: String },
    kyc_status: { type: String },
    suspend_reason: { type: String },
    data: {
        messages: { type: [messageSchema], default: [] }, // default value set to an empty array
    },
    address:{
        landmark:{type:[addressSchema],default:[]}
    },

    likedProducts:[
        {
        pid:{
            type:String
        }
    }
    ],

   cart:{
    type:[cartschema]
   }
    
});

module.exports = mongoose.model('User', userSchema);
