const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const DangerZone = require('./models/DangerZone');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/spendsmart';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true }).then(async ()=> {
  await Transaction.deleteMany({});
  await DangerZone.deleteMany({});

  const now = new Date();
  const sampleTx = [
    { amount: 1200, category: 'Shopping', date: new Date(now.getTime() - 2*24*3600*1000), mood: 'Stressed', note:'Impulse at mall', location:{lat:17.445, lon:78.349} },
    { amount: 250, category: 'Food', date: new Date(now.getTime() - 1*24*3600*1000), mood: 'Happy', note:'Cafe', location:{lat:17.437, lon:78.400} },
    { amount: 600, category: 'Transport', date: new Date(now.getTime() - 4*24*3600*1000), mood: 'Bored', note:'Taxi' },
    { amount: 3000, category: 'Shopping', date: new Date(now.getTime() - 10*24*3600*1000), mood: 'Stressed', note:'Big purchase' },
    { amount: 150, category: 'Groceries', date: new Date(now.getTime() - 3*24*3600*1000), mood: 'Neutral' }
  ];
  await Transaction.insertMany(sampleTx);

  await DangerZone.create({ label:'Mega Mall', center:{lat:17.443, lon:78.345}, radiusMeters:500 });

  console.log('Seeded sample data');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
