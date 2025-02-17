const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    refId: { type: Number, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    Dob: { type: String },
    Gender: { type: String },
    Age: { type: Number },
    Lab: { type: String },
    foundVia: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    location:{type:String},
    service:{type:String}
});

const Booking = mongoose.model('Bookingdetails', bookingSchema);

module.exports = Booking;
