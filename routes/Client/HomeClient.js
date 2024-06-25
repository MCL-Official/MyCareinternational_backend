const express = require('express');
const router = express.Router();
const Banner = require('../../models/banner');
const Product = require('../../models/product');
const Footer = require('../../models/footer');
const Header = require('../../models/header');
const Home = require('../../models/home');

// Header route
router.get('/header', async (req, res) => {
  try {
    const header = await Header.findOne();
    if (!header) {
      return res.status(404).json({ message: 'Header not found' });
    }
    res.status(200).json({ header });
  } catch (error) {
    console.error('Error retrieving Header:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Banner route
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error('Error retrieving banners:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Footer route
router.get('/footer', async (req, res) => {
  try {
    const footer = await Footer.findOne();
    if (!footer) {
      return res.status(404).json({ message: 'Footer not found' });
    }
    res.status(200).json({ footer });
  } catch (error) {
    console.error('Error getting footer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.get('/home', async (req, res) => {
  try {
    const homeData = await Home.findOne();
    res.status(200).json(homeData);
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.get('/top3products', async (req, res) => {
  try {
      // Find the top 3 products based on sales (you might need to adjust the field names)
      const topProducts = await Product.find().sort({ sales: -1 }).limit(3);

      res.status(200).json(topProducts);
  } catch (error) {
      console.error('Error getting top products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;

