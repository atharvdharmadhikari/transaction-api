const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTIC_URL,   // from cloud
  auth: {
    apiKey: process.env.ELASTIC_API_KEY,
  },
});

module.exports = client;