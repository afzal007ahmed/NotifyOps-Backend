const { authMiddleware } = require("../../middlewares/authMiddleware");
const express = require("express");
const { authRouter } = require("./auth");
const { publicRouter } = require("./public");
const { projectRouter } = require("./project");
const { organisationRouter } = require("./origanisation");
const { subscriptionRouter } = require("./subscriptions");
const { logsRouter } = require("./logs");
const { templateRouter } = require("./template");
const { errorMiddleware } = require("../../middlewares/errorMiddleware");

const allRoutes = require("express").Router();

allRoutes.use(express.json());

allRoutes.use("/auth", authRouter);

allRoutes.use("/api", publicRouter);

allRoutes.use(authMiddleware);

allRoutes.use("/projects", projectRouter);

allRoutes.use("/organisations", organisationRouter);

allRoutes.use("/subscriptions", subscriptionRouter);

allRoutes.use("/logs", logsRouter);

allRoutes.use("/templates", templateRouter);

allRoutes.use(errorMiddleware);

module.exports = { allRoutes };
