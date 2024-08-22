// controllers/jobsController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching jobs' });
  }
};

// Get a single job by ID
const getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.job.findUnique({ where: { id } });
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
    const newJob = await prisma.job.create({
      data: {
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
    });
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
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
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
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: 'Error updating job' });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.job.delete({ where: { id } });
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
