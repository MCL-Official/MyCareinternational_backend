// models/VisitorLog.js

const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema({
  mid: { type: String, required: true },
  loginDate: { type: String, required: true },
  success: { type: Boolean, required: true },
  address: {
    city: String,
    region: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
});

const VisitorLog = mongoose.model('VisitorLog', visitorLogSchema);

module.exports = VisitorLog;
