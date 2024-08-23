const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const applyForJob = async (req, res) => {
  const {
    name,
    email,
    resume,
    phoneNumber,
    coverLetter,
    jobId,
    location,
    gender,
    education,
    address,
    college
  } = req.body;

  console.log("Received application data:", req.body);

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    let applicant = await prisma.applicant.findFirst({ where: { email } });
    if (applicant && applicant.jobs.includes(jobId)) {
      return res.status(400).json({ error: "You have already applied for this job." });
    }

    if (applicant) {
      applicant = await prisma.applicant.update({
        where: { id: applicant.id },
        data: {
          name, email, resume, phoneNumber, coverLetter, location, gender, education, address, college,
          jobs: { push: jobId },
        },
      });
    } else {
      applicant = await prisma.applicant.create({
        data: {
          name, email, resume, phoneNumber, coverLetter, location, gender, education, address, college,
          jobs: [jobId],
        },
      });
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { applicants: { push: applicant.id } },
    });

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
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const applicants = await prisma.applicant.findMany({
      where: { id: { in: job.applicants } },
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
    const applicant = await prisma.applicant.findUnique({ where: { id: applicantId } });
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    const jobs = await prisma.job.findMany({ where: { id: { in: applicant.jobs } } });
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
