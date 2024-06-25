const express = require('express');
const router = express.Router();
const Promotion = require('../../models/promotion'); // Assuming your model file is in './promotionModel.js'

router.get('/promotions', async (req, res) => {
    try {
        // Extract the date from the query parameters
        const { date } = req.query;
        console.log(date);
        
        // Validate the date
        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }
        
        
        // Find documents where the date falls within the validity range
        const promotions = await Promotion.find({
            offer_valid_from: { $lte: date }, 
            offer_valid_upto: { $gte: date },
        });

        // Handle the retrieved promotions
        res.status(200).json(promotions);
    } catch (error) {
        // Handle any errors
        console.error('Error fetching promotions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
