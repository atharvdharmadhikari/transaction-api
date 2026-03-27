const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Stock = require("./models/product");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
/* ✅ MongoDB Connection 
mongoose.connect(
  "mongodb+srv://ulkaprocess_db_user:ulka2025@cluster1.htc1ovw.mongodb.net/transaction_db?retryWrites=true&w=majority"
)*/
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ✅ ADD DATA */
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

/* ✅ MINUS DATA */

/* ✅ GET ALL DATA (FOR HOME SCREEN) */
app.get("/data", async (req, res) => {
  try {
    const allData = await Stock.find().sort({ createdAt: -1 });
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.put("/data/update/:id", async (req, res) => {
  try {
    const updated = await Stock.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});