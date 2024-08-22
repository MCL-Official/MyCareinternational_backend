// routes/applicantRoutes.js

const express = require('express');
const { applyForJob, getApplicantsForJob } = require('../../Controller/applicantController');
const router = express.Router();

// Route to apply for a job
router.post('/apply', applyForJob);

// Route to get all applicants for a specific job
router.get('/job/:jobId/applicants', getApplicantsForJob);

module.exports = router;
