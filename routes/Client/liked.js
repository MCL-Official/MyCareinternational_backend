const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/User'); // Assuming your user model is in a separate file
const multer = require('multer');
const upload = multer(); // initialize multer

// Endpoint to add a product to the liked products list
router.post('/liked-products/add', upload.none(), async (req, res) => {
    try {
        const { mid, pid } = req.body;

        // Check if the user exists
        const existingUser = await User.findOne({ mid });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the product already exists in the liked products list
        const productExists = existingUser.likedProducts.some(product => product.pid === pid);
        if (productExists) {
            return res.status(400).json({ message: 'Product already exists in liked list.' });
        }

        // Add the productId to the user's liked products list in the database
        await User.findOneAndUpdate({ mid }, { $addToSet: { 'likedProducts': { pid } } });

        res.status(200).json({ message: 'Product added to liked list successfully.' });
    } catch (error) {
        console.error('Error adding product to liked list:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



router.delete('/liked-products/delete', upload.none(),async (req, res) => {
    try {
        const { mid, pid } = req.body;

        // Check if the user exists
        const existingUser = await User.findOne({ mid });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Remove the product from the user's liked products list in the database
        await User.findOneAndUpdate(
            { mid },
            { $pull: { 'likedProducts': { pid } } }
        );

        res.status(200).json({ message: 'Product removed from liked list successfully.' });
    } catch (error) {
        console.error('Error removing product from liked list:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


router.get('/liked-products/:mid',upload.none(), async (req, res) => {
    try {
        const { mid } = req.params;
        console.log(mid);

        // Check if the user exists
        const existingUser = await User.findOne({ mid });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Retrieve liked products for the user
        const likedProducts = existingUser.likedProducts.map(product => product.pid);

        res.status(200).json({ likedProducts });
    } catch (error) {
        console.error('Error retrieving liked products:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


module.exports = router;
