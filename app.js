const express = require("express");
const app = express();
const fs = require('fs')
const cors = require("cors");
const morgan = require("morgan");
const { config } = require("./config");
const { allRoutes } = require("./routes/index");
const path = require("path");

app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs/access.log"),
  { flags: "a" },
);

app.use(morgan("combined", { stream: accessLogStream }));

app.use("/", allRoutes);

module.exports = { app };
