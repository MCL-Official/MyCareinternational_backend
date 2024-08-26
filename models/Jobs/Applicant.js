const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    coverLetter: {
      type: String,
    },
    location: {
      type: String,
    },
    gender: {
      type: String,
    },
    education: {
      type: String,
    },
    address: {
      type: String,
    },
    college: {
      type: String,
    },
    jobs: {
      type: [String],
      default: [], // Array of job IDs
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const Applicant = mongoose.model('Applicant', ApplicantSchema);
  
  module.exports = Applicant;
  