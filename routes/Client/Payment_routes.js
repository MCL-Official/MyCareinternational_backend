const express = require('express');
const router = express.Router();
const Payment = require('../../models/payment');

router.post('/payment/cards', async (req, res) => {
  try {
    const { mid, card } = req.body; // Changed `cards` to `card`
    console.log(card);
    // Check if card object is provided
    if (!card) {
      return res.status(400).json({ error: "No card object provided" });
    }

    const payment = await Payment.findOneAndUpdate(
      { mid },
      { $push: { cards: card } }, // Push single card object
      { new: true, upsert: true }
    );
    res.status(201).json(payment.cards);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



router.get('/payment/cards/:mid', async (req, res) => {
  try {
    const mid = req.params.mid;
    const payment = await Payment.findOne({ mid });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment.cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/payment/cards/:mid/:cardId', async (req, res) => {
  try {
    const { mid, cardId } = req.params;
    const payment = await Payment.findOneAndUpdate(
      { mid },
      { $pull: { cards: { _id: cardId } } },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment.cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put('/card/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const { mid, updatedCard } = req.body; // Include `mid` in the request body
    const payment = await Payment.findOneAndUpdate(
      { mid, 'cards._id': cardId },
      { $set: { 'cards.$': updatedCard } },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment.cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



  

  

module.exports = router;
