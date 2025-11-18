const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// create transaction
router.post('/', async (req, res) => {
  try {
    const tx = new Transaction(req.body);
    console.log("Creating tx", tx);
    await tx.save();
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get transactions
router.get('/', async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ date: -1 }).limit(500);
    res.json({ transactions: txs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
