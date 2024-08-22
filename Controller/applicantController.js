// controllers/applicantController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Apply for a job or update existing applicant
const applyForJob = async (req, res) => {
  const { name, email, resume, jobId } = req.body;

  try {
    // Verify that the Job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if the applicant already exists by email
    let applicant = await prisma.applicant.findFirst({
      where: { email },
    });

    if (applicant) {
      // Check if the applicant has already applied for the job
      if (applicant.jobs.includes(jobId)) {
        return res.status(400).json({ error: "You have already applied for this job." });
      }

      // Update the existing applicant's job array
      applicant = await prisma.applicant.update({
        where: { id: applicant.id }, // Use the unique id to update
        data: {
          name, // Optionally update name and resume if necessary
          resume,
          jobs: {
            push: jobId, // Add the new job ID to the jobs array
          },
        },
      });
    } else {
      // Create a new applicant
      applicant = await prisma.applicant.create({
        data: {
          name,
          email,
          resume,
          jobs: [jobId], // Initialize jobs array with the current job
        },
      });
    }

    // Update the job's applicants array with the new applicant ID
    await prisma.job.update({
      where: { id: jobId },
      data: {
        applicants: {
          push: applicant.id, // Add applicant ID to the applicants array
        },
      },
    });

    res.status(201).json(applicant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error applying for job' });
  }
};

// Get all applicants for a specific job
const getApplicantsForJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    // Fetch job to access applicants array
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Find applicants whose IDs are in the job's applicants array
    const applicants = await prisma.applicant.findMany({
      where: {
        id: { in: job.applicants },
      },
    });

    res.json(applicants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching applicants' });
  }
};

// Get all jobs for a specific applicant
const getJobsForApplicant = async (req, res) => {
  const { applicantId } = req.params;

  try {
    // Fetch applicant to access jobs array
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Find jobs whose IDs are in the applicant's jobs array
    const jobs = await prisma.job.findMany({
      where: {
        id: { in: applicant.jobs },
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching jobs for applicant' });
  }
};

module.exports = {
  applyForJob,
  getApplicantsForJob,
  getJobsForApplicant,
};
