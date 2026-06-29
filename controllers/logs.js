const { logs } = require("../models");

const logsController = {
  getAllLogs: async (req, res, next) => {
    try {
      const project_id = req.params.id;
      if (!project_id) {
        const err = new Error("Please provide a valid id.");
        err.code = "INVALID_PROJECT_ID";
        err.statusCode = 400;
        throw err;
      }
      const logsData = await logs.findAll({ where: { proj_id: project_id } });
      res.status(200).json({
        data: logsData,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { logsController };
