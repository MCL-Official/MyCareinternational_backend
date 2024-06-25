// Import necessary modules
const express = require('express');
const router = express.Router();
const Contact = require('../../models/contact');

// GET API to fetch all contacts
router.get('/contact', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST API to create a new contact
router.post('/contact', async (req, res) => {
  const contact = new Contact({
    mid: req.body.mid,
    email: req.body.email,
    contactNo: req.body.contactNo,
    phoneNo: req.body.phoneNo,
    message:req.body.message
  });

  try {
    const newContact = await contact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
