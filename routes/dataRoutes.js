const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Schema (collection = products)
const DataSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  vehicleNumber: String,
  driverName: String,
}, { timestamps: true });

const Data = mongoose.model("Product", DataSchema);

// ✅ ADD ENTRY
router.post("/", async (req, res) => {
  try {
    const newData = new Data(req.body);
    await newData.save();

    res.status(201).json({
      success: true,
      data: newData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ GET ALL DATA (HOME SCREEN)
router.get("/", async (req, res) => {
  try {
    const data = await Data.find().sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE ENTRY
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Data.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ DELETE ENTRY
router.delete("/delete/:id", async (req, res) => {
  try {
    await Data.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ REMOVE / MINUS ENTRY (OPTIONAL)
router.post("/remove", async (req, res) => {
  try {
    const newData = new Data(req.body);
    await newData.save();

    res.status(201).json({
      success: true,
      data: newData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;