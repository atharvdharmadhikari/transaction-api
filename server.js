const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Stock = require("./models/product");
const esClient = require("./elastic/elasticClient");

const app = express();

app.use(cors());
app.use(express.json());

/// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

/// ✅ Elastic test
esClient.info()
  .then(() => console.log("✅ Elastic Connected"))
  .catch(err => console.log("❌ Elastic Error:", err));

/// ✅ CREATE INDEX (RUN ONCE)
async function createIndex() {
  try {
    await esClient.indices.create({ index: "transactions" });
    console.log("Index created");
  } catch (err) {
    console.log("Index exists");
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

/// 📥 GET DATA
app.get("/data", async (req, res) => {
  const all = await Stock.find().sort({ createdAt: -1 });
  res.json(all);
});

/// ✏️ UPDATE
app.put("/data/update/:id", async (req, res) => {
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
});

/// 🗑 DELETE
app.delete("/data/delete/:id", async (req, res) => {
  await Stock.findByIdAndDelete(req.params.id);

  await esClient.delete({
    index: "transactions",
    id: req.params.id,
    refresh: true
  });

  res.json({ message: "Deleted" });
});

/// 🔍 SEARCH
app.get("/search", async (req, res) => {
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
});

/// 🚀 SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});