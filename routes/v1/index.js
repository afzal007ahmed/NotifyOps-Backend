const { authMiddleware } = require("../../middlewares/authMiddleware");
const express = require("express");
const { authRouter } = require("./auths");
const { publicRouter } = require("./publics");
const { projectRouter } = require("./projects");
const { organisationRouter } = require("./organisations");
const { subscriptionRouter } = require("./subscriptions");
const { logsRouter } = require("./logs");
const { templateRouter } = require("./templates");
const { errorMiddleware } = require("../../middlewares/errorMiddleware");

const v1Routes = require("express").Router();

v1Routes.use(express.json());

v1Routes.use("/auth", authRouter);

v1Routes.use("/api", publicRouter);

v1Routes.use(authMiddleware);

v1Routes.use("/projects", projectRouter);

v1Routes.use("/organisations", organisationRouter);

v1Routes.use("/subscriptions", subscriptionRouter);

v1Routes.use("/logs", logsRouter);

v1Routes.use("/templates", templateRouter);

v1Routes.use(errorMiddleware);

module.exports = { v1Routes };
