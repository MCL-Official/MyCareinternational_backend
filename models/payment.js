const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  number: String,
  name: String,
  expiry: String,
  cvv: String,
  holderName: String,
  title: String,
  default: Boolean
});

const paymentSchema = new mongoose.Schema({
  method: String,
  mid: String,
  cards: [cardSchema] // Array of card objects
});

module.exports = mongoose.model('Payment', paymentSchema);
