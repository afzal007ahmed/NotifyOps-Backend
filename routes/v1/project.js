const { apiKeysController } = require("../../controllers/apikeys");
const { projectController } = require("../../controllers/projectController");

const projectRouter = require("express").Router();

projectRouter.get("/", projectController.getProjects);

projectRouter.get("/:projectId/api-keys" , apiKeysController.getAllKeys ) ;

projectRouter.post("/:projectId/api-keys" , apiKeysController.generateKey ) ;

projectRouter.put("/api-keys/:id/revoke" , apiKeysController.revoke) ;

projectRouter.delete("/api-keys/:id/delete" , apiKeysController.delete)

projectRouter.get("/:id", projectController.getProjectById);

projectRouter.post("/" , projectController.createProject ) ;

module.exports = { projectRouter };
