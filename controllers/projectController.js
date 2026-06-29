const { project } = require("../models");

const projectController = {
  getProjectById: async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!id) {
        const err = new Error("Please provide a valid id.");
        err.code = "INVALID_PROJECT_ID";
        err.statusCode = 400;
        throw err;
      }
      const projectList = await project.findOne({
        where: { id: id, org_id: req.user.org_id },
      });

      res.status(200).json({
        data: projectList || [],
      });
    } catch (error) {
      next(error);
    }
  },
  getProjects: async (req, res, next) => {
    try {
      const allProjects = await project.findAll({
        where: { org_id: req.user.org_id },
      });
      res.status(200).json({
        data: allProjects || [],
      });
    } catch (error) {
      next(error);
    }
  },
  createProject: async (req, res, next) => {
    try {
      const projectName = req.body.name;
      if (!projectName || projectName.length < 3) {
        const err = new Error("Please provide a project name.");
        err.code = "INVALID_PROJECT_NAME";
        err.statusCode = 400;
        throw err;
      }
      await project.create({
        name: projectName,
        org_id: req.user.org_id,
      });
      res.status(201).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { projectController };
