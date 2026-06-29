const express = require("express");
const app = express();
const cors = require("cors");
const { config } = require("./config");
const { authMiddleware } = require("./middlewares/authMiddleware");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const { authRouter } = require("./routes/auth");
const { projectRouter } = require("./routes/project");
const { subscriptionRouter } = require("./routes/subscriptions");
const { organisationRouter } = require("./routes/origanisation");
const { templateRouter } = require("./routes/template");
const { publicRouter } = require("./routes/public");
const { logsRouter } = require("./routes/logs");

app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE" ],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/auth", authRouter);

app.use('/api/v1' , publicRouter)

app.use(authMiddleware);

app.use("/projects", projectRouter);

app.use("/organisations", organisationRouter);

app.use("/subscriptions", subscriptionRouter);

app.use("/logs" , logsRouter)

app.use("/templates", templateRouter);

app.use(errorMiddleware);

module.exports = { app };
