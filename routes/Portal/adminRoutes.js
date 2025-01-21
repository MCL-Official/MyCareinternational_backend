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

const transporter2 = nodemailer.createTransport({
    service: "Outlook365",
    host: 'smtp.office365.com',
    port: 587,
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
    },
    secure: false,
    auth: {
        user: "info@mycarelabs.com",
        pass: "lnqtrpqcktcppdfm",
    },
    // debug: true,  // Enable debugging
    // logger: true, // Log information
});


const sendContactForm = async (formDetails) => {
    const mailOptions = {
        from: "info@mycarelabs.com",
        // to: "info@mycaretrading.com",
        to: "admin@mycarelabs.com",
        subject: 'Contact Form Submission',
        text: `
            Name: ${formDetails.name}
            Email: ${formDetails.email}
            Message: ${formDetails.message}
            Phone: ${formDetails.phone}
            company: ${formDetails.company}
            agreeToTerms: ${formDetails.agreeToTerms}
        `,
    };

    try {
        await transporter2.sendMail(mailOptions);
        console.log('Contact form details sent successfully using transporter 2');
    } catch (error) {
        console.error('Error sending contact form details:', error);
    }
};

router.post('/api/registerform', async (req, res) => {
    const { name, email, message, phone, agreeToTerms, company } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await sendContactForm({ name, email, phone, message, agreeToTerms, company });
        res.status(200).json({ message: 'Contact form details sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending contact form details' });
    }
});

const sendContactFormIT = async (formDetails) => {
    const mailOptions = {
        from: "info@mycarelabs.com",
        // to: "info@mycaretrading.com",
        to: "info@mycareit.com",
        subject: 'Contact Form Submission from My Care IT',
        text: `
            Name: ${formDetails.name}
            Email: ${formDetails.email}
            Message: ${formDetails.message}
            Phone: ${formDetails.phone}
            company: ${formDetails.company}
            service: ${formDetails.service}
            agreeToTerms: ${formDetails.agreeToTerms}
        `,
    };

    try {
        await transporter2.sendMail(mailOptions);
        console.log('Contact form details sent successfully');
    } catch (error) {
        console.error('Error sending contact form details:', error);
    }
};

router.post('/api/contact/mycareit', async (req, res) => {
    const { name, email, message, phone, agreeToTerms, company, service } = req.body;
    console.log("Request Body:", req.body); // Debugging
    if (!name || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await sendContactFormIT({ name, email, phone, message, agreeToTerms, company, service });
        res.status(200).json({ message: 'Contact form details sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending contact form details' });
    }
});

const sendContactFormNew = async (formDetails) => {
    const mailOptions = {
        from: "info@mycarelabs.com",
        // to: "info@mycaretrading.com",
        to: "admin@mycarelabs.com",
        subject: 'Contact Form Submission from B2B Landing Page',
        text: `
            Name: ${formDetails.name}
            Email: ${formDetails.email}
            Message: ${formDetails.message}
            Phone: ${formDetails.phone}
            company: ${formDetails.company}
        `,
    };

    try {
        await transporter2.sendMail(mailOptions);
        console.log('Contact form details sent successfully');
    } catch (error) {
        console.error('Error sending contact form details:', error);
    }
};

router.post('/api/contact/mycarelabs', async (req, res) => {
    const { name, email, message, phone, company, zipcode } = req.body;
    console.log("Request Body:", req.body); // Debugging
    if (!name || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await sendContactFormNew({ name, email, phone, zipcode, message, company });
        res.status(200).json({ message: 'Contact form details sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending contact form details' });
    }
});

module.exports = router;
