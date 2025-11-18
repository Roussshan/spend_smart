const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DangerZoneSchema = new Schema({
  label: String,
  center: { lat: Number, lon: Number },
  radiusMeters: Number
});

module.exports = mongoose.model('DangerZone', DangerZoneSchema);
