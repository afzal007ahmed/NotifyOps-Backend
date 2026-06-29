const { organisationController } = require("../controllers/organisation");

const organisationRouter = require("express").Router();

organisationRouter.get("/", organisationController.getOrganisationById);
organisationRouter.get("/usage", organisationController.usage);

module.exports = { organisationRouter };
