const Job = require('../models/Jobs/Job'); // Import your Mongoose Job model

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find(); // Fetch all jobs using Mongoose
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching jobs' });
  }
};

// Get a single job by ID
const getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id); // Find a job by ID using Mongoose
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching job' });
  }
};

// Create a new job
const createJob = async (req, res) => {
  const {
    companyLogo,
    title,
    company,
    type,
    salary,
    experience,
    postedTime,
    location,
    skills,
    description,
    responsibilities,
    requirements,
    eligibleDegrees,
    eligibleGraduationYears,
    documentsRequired,
    jobRound,
  } = req.body;

  try {
    const newJob = new Job({
      companyLogo,
      title,
      company,
      type,
      salary,
      experience,
      postedTime,
      location,
      skills,
      description,
      responsibilities,
      requirements,
      eligibleDegrees,
      eligibleGraduationYears,
      documentsRequired,
      jobRound,
    });

    await newJob.save(); // Save the new job using Mongoose
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: 'Error creating job' });
  }
};

// Update a job
const updateJob = async (req, res) => {
  const { id } = req.params;
  const {
    companyLogo,
    title,
    company,
    type,
    salary,
    experience,
    postedTime,
    location,
    skills,
    description,
    responsibilities,
    requirements,
    eligibleDegrees,
    eligibleGraduationYears,
    documentsRequired,
    jobRound,
  } = req.body;

  try {
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        companyLogo,
        title,
        company,
        type,
        salary,
        experience,
        postedTime,
        location,
        skills,
        description,
        responsibilities,
        requirements,
        eligibleDegrees,
        eligibleGraduationYears,
        documentsRequired,
        jobRound,
      },
      { new: true } // Return the updated document
    );
    if (!updatedJob) return res.status(404).json({ error: 'Job not found' });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Error updating job' });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedJob = await Job.findByIdAndDelete(id); // Delete the job by ID using Mongoose
    if (!deletedJob) return res.status(404).json({ error: 'Job not found' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting job' });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
