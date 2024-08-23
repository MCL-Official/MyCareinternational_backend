// routes/applicantRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const { applyForJob, getApplicantsForJob } = require('../../Controller/applicantController');
const router = express.Router();



const uploadDirectory = '/var/www/mycarelabs'; // Ensure this directory exists and is writable
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = generateUniqueRid() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});
const upload = multer({ storage: storage });


// Route to apply for a job
router.post('/apply', upload.single('resume'), applyForJob);

// Route to get all applicants for a specific job
router.get('/job/:jobId/applicants', getApplicantsForJob);

module.exports = router;
