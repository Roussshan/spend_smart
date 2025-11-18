const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  userId: { type: String, default: 'demo' },
  amount: { type: Number, required: true },
  category: { type: String, default: 'General' },
  date: { type: Date, default: Date.now },
  mood: { type: String, enum: ['Stressed','Happy','Bored','Neutral'], default: 'Neutral' },
  note: { type: String, default: '' },
  location: {
    lat: Number,
    lon: Number
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
