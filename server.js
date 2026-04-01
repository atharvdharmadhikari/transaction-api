require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Client } = require("@elastic/elasticsearch");

const app = express();
app.use(cors());
app.use(express.json());

/// 🔗 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/// 🔍 Elasticsearch Client
const esClient = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  },
});

esClient.info()
  .then(() => console.log("✅ Elasticsearch Connected"))
  .catch(err => console.log("Elastic Error:", err));

/// 📦 Schema
const stockSchema = new mongoose.Schema({
  variety: String,
  inwardNo: String,
  vehicleNumber: String,
  species: String,
  balanceKg: String,
  balanceQty: String,
}, { timestamps: true });

const Stock = mongoose.model("Stock", stockSchema);

/// 🔥 CREATE INDEX (run once automatically)
async function createIndex() {
  try {
    await esClient.indices.create({ index: "transactions" });
    console.log("✅ Index created");
  } catch (err) {
    console.log("ℹ️ Index already exists");
  }
}
createIndex();

/// ➕ ADD DATA
app.post("/data", async (req, res) => {
  try {
    const data = new Stock(req.body);
    await data.save();

    await esClient.index({
      index: "transactions",
      id: data._id.toString(),
      document: req.body,
      refresh: true
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// 📥 GET ALL DATA
app.get("/data", async (req, res) => {
  try {
    const data = await Stock.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// ✏️ UPDATE DATA
app.put("/data/update/:id", async (req, res) => {
  try {
    const updated = await Stock.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after" }
    );

    await esClient.update({
      index: "transactions",
      id: req.params.id,
      doc: req.body,
      refresh: true
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// 🗑 DELETE DATA
app.delete("/data/delete/:id", async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);

    await esClient.delete({
      index: "transactions",
      id: req.params.id,
      refresh: true
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// 🔍 SEARCH (Elastic)
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;

    const result = await esClient.search({
      index: "transactions",
      query: {
        multi_match: {
          query: q,
          fields: ["variety", "vehicleNumber", "inwardNo"],
          fuzziness: "AUTO"
        }
      }
    });

    const data = result.hits.hits.map(item => item._source);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// 🚀 SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});