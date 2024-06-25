const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_tR3PYbcVNZZ796tH88S4VQ2u'); // Replace this with your secret key

router.post('/create-checkout-session', async (req, res) => {
    try {
        // Extract total product price from the request body
        const totalPrice = req.body.totalPrice;
        // const quantity  = req.body.totalPrice;

        // Create a line item for the total price
        const lineItems = [{
            price_data: {
                currency: 'usd', // Assuming the currency is always USD
                product_data: {
                    name: 'Total Price', // You can adjust the product name as needed
                },
                unit_amount: totalPrice * 100, // Convert the total price to cents
            },
            quantity: 1,
        }];

        // Create a checkout session using the Stripe API
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            customer_email: req.body.customer_email,
            mode: 'payment',
            success_url: req.body.success_url || `${req.headers.origin}?success=true`,
            cancel_url: req.body.cancel_url || `${req.headers.origin}?canceled=true`,
        });

        // Respond with the ID of the created session
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
