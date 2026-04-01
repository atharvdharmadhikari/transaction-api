const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Schema
const DataSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  vehicleNumber: String,
  driverName: String,
}, { timestamps: true });

const Data = mongoose.model("Data", DataSchema);

// ✅ ADD ENTRY
router.post("/data", async (req, res) => {
  try {
    const newData = new Data(req.body);
    await newData.save();

    res.status(201).json(newData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ➖ REMOVE ENTRY
router.post("/remove", async (req, res) => {
  res.json({ message: "Remove working" });
});

// 🏠 STOCK
router.get("/", async (req, res) => {
  try {
    const data = await Data.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/data/remove", async (req, res) => {
  try {
    const newData = new Data(req.body);
    await newData.save();

    res.status(201).json(newData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;