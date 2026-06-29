const express = require("express");
const app = express();
const cors = require("cors");
const { config } = require("./config");
const { allRoutes } = require("./routes/v1");


app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE" ],
    credentials: true,
  }),
);

app.use('/v1' , allRoutes )

module.exports = { app };
