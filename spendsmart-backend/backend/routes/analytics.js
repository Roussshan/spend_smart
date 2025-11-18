const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

/**
 * Mood patterns:
 * Calculates total spend by mood and baseline, returns percent diff.
 */
router.get('/mood-patterns', async (req,res) => {
  try {
    const txs = await Transaction.find();
    const totals = { Stressed:0, Happy:0, Bored:0, Neutral:0, total:0, count:{} };
    txs.forEach(t => {
      const m = t.mood || 'Neutral';
      totals[m] = (totals[m] || 0) + t.amount;
      totals.total += t.amount;
      totals.count[m] = (totals.count[m] || 0) + 1;
    });

    // compute percent of spending when stressed vs average
    const avg = totals.total / Math.max(1, txs.length);
    const stressedAvg = (totals.count['Stressed'] ? (totals['Stressed'] / totals.count['Stressed']) : 0);
    const percentMoreWhenStressed = avg > 0 ? ((stressedAvg - avg) / avg) * 100 : 0;

    res.json({ totals, percentMoreWhenStressed });
  } catch(err){ res.status(500).json({ error: err.message }); }
});

/**
 * Simple predictive cash flow:
 * - Uses last N transactions to estimate daily average spending, projects forward
 * - Assumes a starting balance passed as query param (or fixed demo balance)
 */
router.get('/forecast', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30');
    const balance = parseFloat(req.query.balance || '20000'); // demo starting balance
    const txs = await Transaction.find().sort({ date: -1 }).limit(200);

    // compute avg daily spend based on last 30 days of transactions
    const now = new Date();
    const cutoff = new Date(now.getTime() - 30*24*3600*1000);
    const recent = txs.filter(t => t.date >= cutoff);
    const totalRecent = recent.reduce((s,t)=>s + t.amount, 0);
    const daysObserved = Math.max(1, ( (now - cutoff) / (24*3600*1000) ));
    const avgDaily = totalRecent / daysObserved;

    // project
    const forecast = [];
    let projected = balance;
    for (let d=1; d<=days; d++){
      projected -= avgDaily;
      forecast.push({ day: d, projected: +projected.toFixed(2) });
    }

    const warnings = [];
    const runShort = forecast.find(f => f.projected < 0);
    if (runShort) {
      warnings.push(`You will run short by ₹${Math.abs(runShort.projected).toFixed(0)} on day ${runShort.day}`);
    }

    res.json({ forecast, avgDaily: +avgDaily.toFixed(2), warnings });
  } catch(err){ res.status(500).json({ error: err.message }); }
});

/**
 * Mock nearby alternatives: returns cheap alternatives within 3km (demo)
 */
router.get('/nearby-alternatives', async (req,res) => {
  const lat = parseFloat(req.query.lat || '0');
  const lon = parseFloat(req.query.lon || '0');
  // For prototype return static mocked places (in real app query external Places API)
  const alternatives = [
    { name: 'Budget Mart', lat: lat + 0.01, lon: lon + 0.01, estSavingPercent: 30 },
    { name: 'Discount Bazaar', lat: lat - 0.007, lon: lon + 0.004, estSavingPercent: 20 }
  ];
  res.json({ alternatives });
});

module.exports = router;
