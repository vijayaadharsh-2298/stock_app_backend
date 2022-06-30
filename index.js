const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const expresServer = express();

const url = "mongodb://localhost:27017";

expresServer.use(express.json());
expresServer.use(cors());

expresServer.get("/getAllCompanyDetails", async (req, res) => {
  try {
    await MongoClient.connect(url, async (err, db) => {
      if (err) throw err;
      const dbo = db.db('Stock_Details');
      const response = await dbo.collection("CompanyStockDetails").find().toArray();

      if (!!response && response.length > 0) {
        res.status(200).send(response);
      } else {
        res.status(200).send({
          code: 404,
          message: "No details found"
        })
      }
    })
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong",
      error
    })
  }
})

expresServer.get('/getCompanyDetail', async (req, res) => {
  try {
    await MongoClient.connect(url, async (err, db) => {
      if (err) throw err;
      const dbo = db.db('Stock_Details');
      const { companyId } = req.query;
      const isAvailable = await dbo.collection("CompanyStockDetails").findOne({ Symbol: companyId });
      if (!!isAvailable) {
        res.status(200).send(isAvailable);
      } else {
        res.status(404).send({
          message: "No details found"
        })
      }
    });
  } catch (error) {
    res.status(400).send({
      message: "Something went wrong",
      error
    })
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

      const isAvailable = await dbo.collection("CompanyStockDetails").findOne({ Symbol: companyId });

      if (response && response.data && Object.keys(response.data).length > 0) {
        if (isAvailable === null) {
          dbo.collection('CompanyStockDetails').insertOne(response.data, (result) => {
            res.status(201).send({
              message: "Successfully created"
            });
            db.close();
          })
        } else {
          res.status(200).send({
            message: "Already existed"
          });
        }
      } else {
        throw new Error("No details found.")
      }

    } catch (err) {
      res.status(400).send({
        message: "Something went wrong",
        error
      });
    }
  });
})

expresServer.listen(3000, function () {
  console.log("3000 running successfully...")
});
