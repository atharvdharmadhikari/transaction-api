require('dotenv').config();
require('./server');

const Product = require('./models/product');
const client = require('./elastic/elasticClient');

const sync = async () => {
  try {
    const data = await Product.find();

    for (let item of data) {
      await client.index({
        index: 'products',
        id: item._id.toString(),
        body: item
      });
    }

    console.log("✅ Data synced");
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

setTimeout(sync, 3000); // 🔥 wait for DB connect