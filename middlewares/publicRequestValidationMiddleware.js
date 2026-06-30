const { apiKeys, template, project } = require("../models");
const crypto = require("crypto");
const { allowedChannels } = require("../utils/contants");

const publicRequestValidationMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(400).json({
        success: false,
        code: "API_KEY_MISSING",
        message: "Api key is missing",
      });
    }

    const apiKey = req.headers.authorization.split(" ")[1];

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        code: "API_KEY_MISSING",
        message: "Api key is missing",
      });
    }

    const hashApiKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    const apiKeyExists = await apiKeys.findOne({
      where: {
        hash_key: hashApiKey,
        status: "active",
      },
    });

    if (!apiKeyExists) {
      return res.status(400).json({
        success: false,
        code: "INVALID_API_KEY",
        message: "Invalid Api Key",
      });
    }

    const templateId = req.body.template_id;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_TEMPLATE_ID",
        message: "Missing template id",
      });
    }
    const findTemplate = await template.findOne({
      where: {
        proj_id: apiKeyExists.proj_id,
        id: templateId,
      },
    });
    if (!findTemplate) {
      return res.status(400).json({
        success: false,
        code: "INVALID_TEMPLATE_ID",
        message: "Invalid template id",
      });
    }

    const variables = req.body.data;

    if (!Array.isArray(req.body.data) && typeof req.body.data !== "object") {
      return res.status(400).json({
        success: false,
        code: "INVALID_DATA",
        message: "data must be an object/array",
      });
    }

    if (
      req.body.data &&
      typeof req.body.data === "object" &&
      !Array.isArray(req.body.data)
    ) {
      for (const variable of findTemplate.variables) {
        if (variables[variable] === undefined) {
          return res.status(400).json({
            success: false,
            code: "INVALID_DATA",
            message: `Missing ${variable} data`,
          });
        }
      }
    } else {
      for (let data of req.body.data) {
        for (const variable of findTemplate.variables) {
          if (data[variable] === undefined) {
            return res.status(400).json({
              success: false,
              code: "INVALID_DATA",
              message: `Missing ${variable} data`,
            });
          }
        }
      }
    }

    if (!req.body.channel) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CHANNEL",
        message: "Please provide channel",
      });
    }

    const channel = Array.isArray(req.body.channel)
      ? req.body.channel
      : [req.body.channel];


    for (let i of channel) {
      if (!allowedChannels.includes(i)) {
        return res.status(400).json({
          success: false,
          code: "CHANNEL_INVALID",
          message: `${i} is not a valid channel`,
        });
      }
    }

    const projectData = await project.findOne({
      where: { id: findTemplate.proj_id },
      attributes: ["org_id"],
    });

    req.user = {
      project_id: findTemplate.proj_id,
      org_id: projectData.org_id,
    };


    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "Something went wrong",
    });
  }
};

module.exports = { publicRequestValidationMiddleware };
