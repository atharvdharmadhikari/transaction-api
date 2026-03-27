const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Stock = require("./models/product");

const app = express();

app.use(cors());
app.use(express.json());

/// ✅ ROOT ROUTE (IMPORTANT for Render)
app.get("/", (req, res) => {
  res.send("API is running...");
});

/// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Mongo Error:", err));

/// ✅ ADD
app.post("/data", async (req, res) => {
  try {
    const newData = new Stock(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

/// ✅ GET
app.get("/data", async (req, res) => {
  try {
    const allData = await Stock.find().sort({ createdAt: -1 });
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// ✅ UPDATE
app.put("/data/update/:id", async (req, res) => {
  try {
    const updated = await Stock.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // 🔥 FIXED
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// ✅ DELETE
app.delete("/data/delete/:id", async (req, res) => {
  try {
    const deleted = await Stock.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/// ✅ SINGLE LISTEN (FIXED)
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});