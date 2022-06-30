const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const expresServer = express();

const url = "mongodb://localhost:27017";

expresServer.use(express.json());
expresServer.use(cors());


expresServer.get('/', async function (req, res) {
  const { companyId } = req.query;

  const req_url =
    'https://www.alphavantage.co/query?function=OVERVIEW&symbol=' + companyId + '&apikey=SQVTXIQMTBY2CVA2';

  try {
    let response = await axios({
      method: 'GET',
      url: req_url
    });
    res.send(response.data);
  } catch (err) {
    console.log(err)

  }
});

expresServer.post('/', async (req, res) => {
  await MongoClient.connect(url, async (err, db) => {
    if (err) throw err;
    const dbo = db.db('Stock_Details');
    const { companyId } = req.query;
    const req_url =
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${companyId}&apikey=SQVTXIQMTBY2CVA2`;


    try {
      const response = await axios({
        method: 'GET',
        url: req_url
      });
      console.log(response.data);

      const isAvailable = await dbo.collection("CompanyStockDetails").findOne({ Symbol: companyId });
      if (Object.keys(isAvailable).length === 0) {
        dbo.collection('CompanyStockDetails').insertOne(response.data, (result) => {
          res.send(response.data);
          db.close();
        })
      } else {
        res.send(response.data);
      }

    } catch (err) {
      console.log(err);
    }
  });
})

expresServer.listen(3000, function () {
  console.log("3000 running successfully...")
});
