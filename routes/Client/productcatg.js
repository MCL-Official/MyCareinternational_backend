const express = require('express');
const PromoCode = require('../../models/promoCode');
const Product = require('../../models/product');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Role = require('../../models/Role');
const path = require('path');
const authMiddleware = require('../../middleware/Middleware');

// const permissionsForGet = [
//   { catg: 'Inventory', operation: 'read' },
//   { catg: 'Inventory', operation: 'Create' },
//   { catg: 'Inventory', operation: 'update' },
//   { catg: 'Inventory', operation: 'delete' },
// ];
// Multer setup for handling form data
const upload = multer();

// Read (GET)
router.get('/promocode', async (req, res) => {
  try {
    // const authToken = req.headers.authorization || req.headers.Authorization;
    // console.log(authToken);
    // if (!authToken) {
    //   return res.status(401).json({ message: 'Unauthorized: Missing authentication token' });
    // }

    // // Decode the authentication token
    // const decodedToken = jwt.verify(authToken, 'your-secret-key');

    // // Check if the decoded token has the necessary fields (userId, uid, role)
    // if (!decodedToken || !decodedToken.userId || !decodedToken.uid || !decodedToken.role) {
    //   return res.status(401).json({ message: 'Unauthorized: Invalid authentication token' });
    // }

    // // Get the user's role and permissions from the database based on the decoded token
    // const userRole = decodedToken.role;
    // const userPermissionsArray = await Role.findOne({ role: userRole });
    // console.log(userPermissionsArray);

    // // Check if the user has permission to read promo codes in the "Content" category
    // const canReadPromoCodes = userPermissionsArray.permissions.some(permission =>
    //   permission.catg === 'Content' && permission.read
    // );

    // if (!canReadPromoCodes) {
    //   return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    // }

    // Retrieve the promo code data (assuming only one record is stored)
    const promoCodeData = await PromoCode.findOne();
    res.status(200).json(promoCodeData);
  } catch (error) {
    console.error('Error fetching promo code data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// router.get('/products',authMiddleware(permissionsForGet?.[0].catg,permissionsForGet?.[0].operation), async (req, res) => {
router.get('/products', async (req, res) => {
  try {
     const products = await Product.find();
      res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.get('/top3products', async (req, res) => {
  try {
      const topProducts = await Product.find().sort({ sales: -1 }).limit(3);

      if (topProducts.length === 0) {
          return res.status(404).json({ message: "No products found" });
      }

      res.status(200).json(topProducts);
  } catch (error) {
      console.error('Error getting top products:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


module.exports = router