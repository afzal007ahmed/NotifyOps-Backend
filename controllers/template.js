const { template } = require("../models");
const {
  parseTemplatePayload,
  findTemplateVariables,
} = require("../utils/helper");
const { createTemplateSchema } = require("../validations/zod");

const templateController = {
  createTemplate: async (req, res, next) => {
    try {
      const templateData = parseTemplatePayload(req.body);
      const result = createTemplateSchema.safeParse(templateData);
      if (!result.success) {
        const Err = new Error(result.error.issues[0].message);
        Err.code = "INVALID_DATA";
        Err.statusCode = 400;
        throw Err;
      }

      const project_id = req.body.projectId;
      if (!project_id) {
        const err = new Error("Please provide a valid id.");
        err.code = "INVALID_PROJECT_ID";
        err.statusCode = 400;
        throw err;
      }

      const name = await template.findOne({
        where: {
          template_name: templateData.template_name,
          proj_id: req.body.projectId,
        },
      });

      if (name) {
        const Err = new Error("Duplicate template name found.");
        Err.code = "DUPLICATE_TEMPLATE_NAME";
        Err.statusCode = 409;
        throw Err;
      }

      const variables = [
        ...findTemplateVariables(templateData.body),
        ...findTemplateVariables(templateData.title),
      ].reduce((first, second) => {
        if (!first.includes(second)) {
          first.push(second);
        }
        return first;
      }, []);

      templateData.variables = variables;
      templateData.proj_id = project_id;
      await template.create(templateData);
      res.status(201).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
  allTemplates: async (req, res, next) => {
    try {
      const project_id = req.params.id;
      if (!project_id) {
        const err = new Error("Please provide a valid id.");
        err.code = "INVALID_PROJECT_ID";
        err.statusCode = 400;
        throw err;
      }
      const templates = await template.findAll({
        where: { proj_id: project_id },
      });
      const templateResponse = templates.map((item) => ({
        template_name: item.template_name,
        createdAt: item.createdAt,
        id: item.id,
        channel: item.channel,
      }));
      res.status(200).json({
        data: templateResponse,
      });
    } catch (error) {
      next(error);
    }
  },
  getTemplateById: async (req, res, next) => {
    try {
      const template_id = req.params.id;
      if (!template_id) {
        const err = new Error("Please provide a valid id.");
        err.code = "INVALID_TEMPLATE_ID";
        err.statusCode = 400;
        throw err;
      }
      const templateData = await template.findOne({
        where: { id: template_id },
        attributes: ["createdAt", "template_name", "body", "title", "id"],
      });

      res.status(200).json({
        data: templateData,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { templateController };
