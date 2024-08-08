const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: true,
  },
  lastName: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
  },
  phone: {
    type: String,
    // required: true,
  },
  reason: {
    type: String,
    // required: true,
  },
  zipCode: {
    type: String,
    // required: true,
  },
  instructions: {
    type: String,
    // required: true,
  },
  passportDetails: {
    type: String,
    // required: true,
  },
  Employee: {
    type: String,
    // required: true,
  },
  Location: {
    type: String,
    // required: true,
  },
  Service: {
    type: String,
    // required: true,
  },
  foundVia: {
    type: String,
    // required: true,
  },
  date: {
    type: Date,
    // required: true,
  },
  time: {
    type: String,
    // required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
