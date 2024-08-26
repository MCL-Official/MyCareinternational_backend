const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  companyLogo: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  postedTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    default: [],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  responsibilities: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  eligibleDegrees: {
    type: [String],
    required: true,
  },
  eligibleGraduationYears: {
    type: String,
    required: true,
  },
  documentsRequired: {
    type: String,
    required: true,
  },
  jobRound: {
    type: String,
    required: true,
  },
  applicants: {
    type: [String],
    default: [], // Array of applicant IDs
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

JobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Job = mongoose.model('Job', JobSchema);

module.exports = Job;
