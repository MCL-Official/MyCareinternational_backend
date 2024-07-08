const express = require('express');
const router = express.Router();// Import your userController
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "Harshkhosla9945@gmail.com",
        pass: "smos vryu mccy rhqp",
    },
});

const sendContactForm = async (formDetails) => {
    const mailOptions = {
        from: "Harshkhosla9945@gmail.com",
        to: "info@mycaretrading.com",
        subject: 'Contact Form Submission',
        text: `
            Name: ${formDetails.name}
            Email: ${formDetails.email}
            Message: ${formDetails.message}
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Contact form details sent successfully');
    } catch (error) {
        console.error('Error sending contact form details:', error);
    }
};

router.post('/api/registerform', async (req, res) => {
    const { name, email, message, phnone } = req.body;

    if (!name || !email || !message || !phnone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await sendContactForm({ name, email, phnone, message });
        res.status(200).json({ message: 'Contact form details sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending contact form details' });
    }
});

module.exports = router;
