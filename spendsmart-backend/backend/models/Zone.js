const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  radius: { type: Number, default: 200 },
  label: { type: String, default: "zone" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Zone", zoneSchema);
