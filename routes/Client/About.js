const express = require('express');
const router = express.Router();
const multer = require('multer');
const About = require('../../models/about');
const TermsAndConditions= require('../../models/termsAndConditions');
const path = require('path');
const Role = require('../../models/Role');
const jwt = require('jsonwebtoken');
const PrivacyPolicy = require('../../models/privacyPolicy');
const uploadDirectory = '/var/www/html/tss_files/about';
// const uploadDirectory = 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = generateUniqueRid() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});

function generateUniqueRid() {
  return `RID${Date.now()}`;
}
const upload = multer({ storage: storage });

// GET API to fetch about page data
router.get('/about', async (req, res) => {
    try {
        const aboutData = await About.find();
        res.json(aboutData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST API to update about page data
router.post('/', async (req, res) => {
    try {
        let aboutData = await About.findOne();
        if (!aboutData) {
            aboutData = new About();
        }
        aboutData.AboutBanner = req.body.AboutBanner;
        aboutData.title1 = req.body.title1;
        aboutData.title2 = req.body.title2;
        aboutData.MissionSection = req.body.MissionSection;
        aboutData.VisionSection = req.body.VisionSection;
        aboutData.SEOArea = req.body.SEOArea;
        aboutData.link = req.body.link;

        const updatedAbout = await aboutData.save();
        res.status(201).json(updatedAbout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.put('/about', upload.fields([
    { name: 'AboutBanner.image', maxCount: 1 },
    { name: 'MissionSection.image', maxCount: 1 },
    { name: 'VisionSection.image', maxCount: 1 },
    { name: 'SEOArea.images', maxCount: 1 },
  ]), async (req, res) => {
    try {
      const updatedData = req.body;
      const files = req.files;
  
      req.body.image=req.file && req.file.filename ?req.file.filename:null
      if(!req.body.image){
          delete req.body.image
      }
      for (const field of [
        'AboutBanner.image',
        'MissionSection.image',
        'VisionSection.image',
        'SEOArea.images',
      ]) {
        
        if (files[field]) {
          updatedData[field] = `http://64.227.186.165/tss_files/about/${files[field][0].filename}`;
        }
      }
  
      const existingAbout = await About.findOne();
  
      // You can now use updatedData to update the document in your database
      if (!existingAbout) {
        // If no about data exists, create a new one
        const newAbout = await About.create(updatedData);
        res.status(201).json(newAbout);
      } else {
        // Update the existing about data
        const updatedAbout = await About.findByIdAndUpdate(existingAbout._id, updatedData, { new: true });
        res.status(200).json(updatedAbout);
      }
    } catch (error) {
      console.error('Error updating about data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  router.post('/termsAndConditions', upload.none(),async (req, res) => {
    try {
      const { content } = req.body;
      let doc = await TermsAndConditions.findOne();
  
      if (!doc) {
        doc = new TermsAndConditions({ content });
      } else {
        doc.content = content;
      }
  
      await doc.save();
  
      res.status(200).json({ message: 'Terms and Conditions updated successfully' });
    } catch (error) {
      console.error('Error updating Terms and Conditions:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  // Assuming you have already imported required modules and model (TermsAndConditions) 

router.get('/termsAndConditions', async (req, res) => {
    try {
        const doc = await TermsAndConditions.findOne();
        
        if (!doc) {
            return res.status(404).json({ message: 'Terms and Conditions not found' });
        }

        res.status(200).json({ content: doc.content });
    } catch (error) {
        console.error('Error fetching Terms and Conditions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.post('/privacyPolicy', upload.none(),async (req, res) => {
    try {
      const { content } = req.body;
      let doc = await PrivacyPolicy.findOne();
  
      if (!doc) {
        doc = new PrivacyPolicy({ content });
      } else {
        doc.content = content;
      }
  
      await doc.save();
  
      res.status(200).json({ message: 'Privacy Policy updated successfully' });
    } catch (error) {
      console.error('Error updating Privacy Policy:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  router.get('/privacyPolicy', async (req, res) => {
    try {
      const doc = await PrivacyPolicy.findOne();
  
      if (!doc) {
        return res.status(404).json({ message: 'Privacy Policy not found' });
      }
  
      res.status(200).json({ content: doc.content });
    } catch (error) {
      console.error('Error retrieving Privacy Policy:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


module.exports = router;
