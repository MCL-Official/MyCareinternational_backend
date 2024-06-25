const express = require('express');
const multer = require('multer');
const uuid = require('uuid');
const Product = require('../../models/product');
const jwt = require('jsonwebtoken');
const Role = require('../../models/Role');
const excel = require('exceljs'); 
const { Readable } = require('stream');
const router = express.Router();
const ExcelJS = require('exceljs');
const authMiddleware = require('../../middleware/Middleware');
const path = require('path');
const product = require('../../models/product');
const Review = require('../../models/Review');

// const permissionsForGet = [
//   { catg: 'Inventory', operation: 'read' },
//   { catg: 'Inventory', operation: 'Create' },
//   { catg: 'Inventory', operation: 'update' },
//   { catg: 'Inventory', operation: 'delete' },
// ];


const uploadDirectory = '/var/www/html/tss_files/product';

//  router.get('/:pid',authMiddleware(permissionsForGet?.[0].catg,permissionsForGet?.[0].operation), async (req, res) => {
 router.get('/:pid', async (req, res) => {
    try {
      const product = await Product.findOne({ pid: req.params.pid });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get("/",async(req,res)=>{
    try {
      let ProductData=await product.find()
      console.log("productData",ProductData);
      ProductData[0].ReviewRadhe="king jaemr"
      console.log("ReviewData",ProductData[0]);
    
      res.status(200).json({message:"get product successfully",ProductData,ReviewData})
    } catch (error) {
      console.log("error get all reviews",error);
      res.status(500).json("Interval server error")
    }
    
 
    
  })
//   router.post('/liked-products/add',async (req, res) => {
//     try {
//         const { mid, pid } = req.body;

//         // Add the productId to the user's liked products list in the database
//         await user.findByIdAndUpdate(mid, { $addToSet: { likedProducts: pid } });

//         res.status(200).json({ message: 'Product added to liked list successfully.' });
//     } catch (error) {
//         console.error('Error adding product to liked list:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// });
  
  // router.get('/similar/:category',authMiddleware(permissionsForGet?.[0].catg,permissionsForGet?.[0].operation), async (req, res) => {
  router.get('/similar/:category', async (req, res) => {
    try {
      const product = await Product.find({ category: req.params.category });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/similars/:sub_category', async (req, res) => {
    try {
      const product = await Product.find({ sub_category: req.params.sub_category });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports = router;