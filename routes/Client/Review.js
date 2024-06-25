const express = require('express');
const router = express.Router();
const Review = require('../../models/Review');
const Product = require('../../models/product');
const path = require("path");
const multer = require('multer');

const jwt = require('jsonwebtoken');
const Role = require('../../models/Role');
const { pid } = require('process');

// const uploadDirectory = "uploads"; // Change the upload directory as needed///
const uploadDirectory = '/var/www/html/tss_files/home'; // Change the upload directory as needed



function generateUniqueRid() {
    return `RID${Date.now()}`;
  }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    console.log("multer", file);

    const uniqueFileName =
      generateUniqueRid() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});



const upload = multer({ storage: storage });

router.post('/reviews', upload.single("review_photo"), async (req, res) => {
  try {
    const { mid, pid, product_name, rating, review, location, Age, Height, BodyType, FitPurchased, SizePurchased, SizeWorn, username,review_photo } = req.body;

    const uniqueFileName = req.file.filename;
    console.log(uniqueFileName);
    const url = `http://64.227.186.165/tss_files/home/${uniqueFileName}`;

    // Find the product
    const product = await Product.findOne({ pid });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // // Calculate new average rating
    // const currentRating = Number(product.rating) * product.data.review.length; // Calculate total rating
    // const newTotalRating = currentRating + Number(rating); // Add the new rating
    // const newAverageRating = newTotalRating / (product.data.review.length + 1); // Calculate new average rating

    // Update product's rating
    
    // Add the new review to the product's data
    product.data.review.push({
    mid,
    product_name,
    rating,
    review,
    location,
    Age,
    Height,
    BodyType,
    FitPurchased,
    SizePurchased,
    SizeWorn,
    review_photo: url,
    rid: generateUniqueRid(),
    username
  });
  
  // Calculate average rating and total count of reviews
  const totalReviews = product.data.review.length;
  const totalRating = product.data.review.reduce((sum, { rating }) => sum + rating, 0);
  const averageRating = totalRating / totalReviews;
  
  // Update product's average rating and total count of reviews
  product.data.average_rating = averageRating;
  product.data.total_reviews = totalReviews;
  
  product.rating = averageRating;
    // Save the updated product
    await product.save();

    res.status(201).json({ message: 'Review added successfully', product });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Read operation - GET all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
   
    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read operation - GET a specific review by ID
router.get('/reviews/:mid', async (req, res) => {
    try {
      const review = await Review.findOne({ mid: req.params.mid });
     
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json(review);
    } catch (error) {
      console.error('Error getting review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/reviews/product/:pid', async (req, res) => {
    try {
    // console.log(req.params.pid);
    // console.log("Ab");
      const review = await Product.findOne({ pid: req.params.pid});
     console.log(review.data.review)
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json(review.data.review);
    } catch (error) {
      console.error('Error getting review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// Update operation - PUT
router.put('/reviews/product/:mid', upload.none(),async (req, res) => {
    try {
    
      const updatedReview = await Review.findOneAndUpdate({ mid: req.params.mid }, req.body, { new: true });

      if (!updatedReview) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json(updatedReview);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete operation - DELETE
  router.delete('/reviews/:mid', async (req, res) => {
    try {
      const deletedReview = await Review.findOneAndDelete({ mid: req.params.mid });
      if (!deletedReview) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json(deletedReview);
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

module.exports = router;
