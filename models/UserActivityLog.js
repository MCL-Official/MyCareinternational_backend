// models/UserActivityLog.js

const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
  mid: { type: String},
  loginDate: { type: String },
  visitorCount: { type: Number, default: 0 },
  loginCount:{type: Number, default: 0},
  SignupCount:{type: Number, default: 0}
});

const UserActivityLog = mongoose.model('UserActivityLog', userActivityLogSchema);

module.exports = UserActivityLog;
