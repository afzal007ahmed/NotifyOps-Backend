const { authMiddleware } = require("../../middlewares/authMiddleware");
const express = require("express");
const { authRouter } = require("./auths");
const { publicRouter } = require("./publics");
const { projectRouter } = require("./projects");
const { organisationRouter } = require("./origanisations");
const { subscriptionRouter } = require("./subscriptions");
const { logsRouter } = require("./logs");
const { templateRouter } = require("./templates");
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
