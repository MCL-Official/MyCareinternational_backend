const Job = require('../models/Jobs/Job'); // Import your Mongoose Job model
const Applicant = require('../models/Jobs/Applicant'); // Import your Mongoose Applicant model

const applyForJob = async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    coverLetter,
    jobId,
    location,
    gender,
    education,
    address,
    college
  } = req.body;

  // The resume file path should be taken from req.file if multer successfully uploaded it
  const uniqueFileName = req.file ? req.file.filename : null;

  // Construct the URL where the resume will be accessible
  const resumeUrl = uniqueFileName ? `https://backend.mycaretrading.com/mycarelabs/${uniqueFileName}` : null;

  console.log("Received application data:", req.body);

  console.log("Received application data:", req.body);

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  if (!resume) {
    return res.status(400).json({ error: "Resume is required" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    let applicant = await Applicant.findOne({ email });
    if (applicant && applicant.jobs.includes(jobId)) {
      return res.status(400).json({ error: "You have already applied for this job." });
    }

    if (applicant) {
      applicant.name = name;
      applicant.resume = resumeUrl; // Update with the resume file path
      applicant.phoneNumber = phoneNumber;
      applicant.coverLetter = coverLetter;
      applicant.location = location;
      applicant.gender = gender;
      applicant.education = education;
      applicant.address = address;
      applicant.college = college;
      applicant.jobs.push(jobId);
    } else {
      applicant = new Applicant({
        name,
        email,
        resume, // Set the resume file path
        phoneNumber,
        coverLetter,
        location,
        gender,
        education,
        address,
        college,
        jobs: [jobId],
      });
    }

    await applicant.save();

    job.applicants.push(applicant._id);
    await job.save();

    res.status(201).json(applicant);
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getApplicantsForJob = async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const applicants = await Applicant.find({
      _id: { $in: job.applicants },
    });

    res.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getJobsForApplicant = async (req, res) => {
  const { applicantId } = req.params;

  if (!applicantId) {
    return res.status(400).json({ error: "Applicant ID is required" });
  }

  try {
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    const jobs = await Job.find({
      _id: { $in: applicant.jobs },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs for applicant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  applyForJob,
  getApplicantsForJob,
  getJobsForApplicant,
};
