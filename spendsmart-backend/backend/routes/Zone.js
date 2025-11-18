// backend/routes/zones.js
import express from "express";
import Zone from "../models/Zone.js";

const router = express.Router();

// GET /api/zones  — list all zones
router.get("/", async (req, res) => {
  try {
    const zones = await Zone.find().sort({ createdAt: -1 }).lean();
    res.json(zones);
  } catch (err) {
    console.error("GET /api/zones error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/zones  — create a new zone
router.post("/", async (req, res) => {
  try {
    const { lat, lon, radius, label, userId } = req.body;
    if (typeof lat !== "number" || typeof lon !== "number") {
      return res.status(400).json({ error: "lat and lon must be numbers" });
    }
    const z = new Zone({ lat, lon, radius, label, userId });
    const saved = await z.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/zones error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/zones/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Zone.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/zones/:id error", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
