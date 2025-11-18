const express = require("express");
const Zone = require("../models/Zone");

const router = express.Router();

// GET all zones
router.get("/", async (req, res) => {
  try {
    const zones = await Zone.find().sort({ createdAt: -1 }).lean();
    res.json(zones);
  } catch (err) {
    console.error("GET /api/danger-zones error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create zone
router.post("/", async (req, res) => {
  try {
    const { lat, lon, radius = 200, label = "zone" } = req.body;

    if (typeof lat !== "number" || typeof lon !== "number") {
      return res.status(400).json({ error: "lat and lon must be numbers" });
    }

    const z = new Zone({ lat, lon, radius, label });
    const saved = await z.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/danger-zones error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE zone by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Zone.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/danger-zones error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
