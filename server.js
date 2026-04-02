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
  serverSelectionTimeoutMS: 5000,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Mongo Error:", err));

/// ✅ ADD
const client = require('./elastic/elasticClient');


app.post('/add', async (req, res) => {
  try {
    const data = await Stock.create(req.body);

    // Elastic (safe)
    try {
      await client.index({
        index: 'products',
        id: data._id.toString(),
        body: data.toObject(),
      });
    } catch (e) {
      console.log("Elastic Error:", e.message);
    }

    // ✅ FIX: send id properly
    const responseData = {
      id: data._id,
      ...data.toObject(),
    };

    res.status(201).json({
      success: true,
      data: responseData,
    });

  } catch (err) {
    console.log("ADD ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/// ✅ GET
app.get("/data", async (req, res) => {
  try {
    const allData = await Stock.find().sort({ createdAt: -1 });

    const formatted = allData.map(item => ({
      id: item._id,
      ...item.toObject(),
    }));

    res.json({
      success: true,
      data: formatted,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
/// ✅ UPDATE
app.put('/update/:id', async (req, res) => {
  try {
    const updated = await Stock.findByIdAndUpdate(  // ✅ FIXED
      req.params.id,
      req.body,
      { new: true }
    );

    try {
      await client.update({
        index: 'products',
        id: req.params.id,
        doc: req.body,
        refresh: true,
      });
    } catch (e) {
      console.log("Elastic Error:", e.message);
    }

    res.json({
      success: true,
      data: {
        id: updated._id,
        ...updated.toObject(),
      },
    });

  } catch (err) {
    console.log("UPDATE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
/// ✅ DELETE
app.delete('/delete/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    await client.delete({
      index: 'products',
      id: req.params.id,
      refresh: true,
    });

   res.json({
  success: true,
  message: "Deleted"
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    const result = await client.search({
      index: 'products',
      body: {
        query: {
          multi_match: {
            query: query,
            fields: [
              'vehicleNumber',
              'variety',
              'species',
              'partyName',
              'lotNo',
              'poNo',
              'location',
              'harvestArea'
            ],
            fuzziness: 'AUTO',
          },
        },
      },
    });

    const data = result.hits.hits.map(item => ({
      id: item._id,
      ...item._source,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// ✅ SINGLE LISTEN (FIXED)
const PORT = process.env.PORT || 5000;

app.listen(5000, "0.0.0.0", () => {
  console.log(`Server running on port 5000`);
});