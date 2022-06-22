const express = require("express");
const axios = require("axios");

const expressServer = express();

expressServer.use(express.json());

expressServer.get("/", async (request, response) => {
  const { companyId } = request.body;

  const URL = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${companyId}&apikey=${process.env.API_KEY}`;

  try {
    const responseData = await axios({
      method: "GET",
      url: URL,
    });
    response.status(200).send(responseData.data);
  } catch (error) {
    response.status(400).send(error)
  }

});

expressServer.listen(3000);
