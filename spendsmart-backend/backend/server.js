// backend/server.js (CommonJS)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const dangerZonesRouter = require('./routes/dangerzones');
const transactionsRouter = require('./routes/transactions');
const analyticsRouter = require('./routes/analytics');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/ping', (req, res) => res.json({ ok: true }));

// API routes (match frontend expectations)
app.use('/api/danger-zones', dangerZonesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/analytics', analyticsRouter);

// connect to MongoDB
const MONGO_URI = 'mongodb://localhost:27017/spend';
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to mongodb');
    const port = process.env.PORT || 4001;
    app.listen(port, () => console.log(`Server listening on ${port}`));
  })
  .catch((err) => {
    console.error('Mongo connection error', err);
    // Do not exit in development — start the server so frontend/dev can run.
    const port = process.env.PORT || 4001;
    console.warn('Starting server without DB connection (read-only / mocked responses may fail)');
    app.listen(port, () => console.log(`Server listening on ${port} (no DB)`));
  });
