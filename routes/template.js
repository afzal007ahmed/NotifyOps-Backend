const { templateController } = require("../controllers/template");

const templateRouter = require("express").Router();

templateRouter.post("/", templateController.createTemplate);

templateRouter.get("/all/:id", templateController.allTemplates);

templateRouter.get("/:id", templateController.getTemplateById);

module.exports = { templateRouter };
