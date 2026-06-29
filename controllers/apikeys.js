const crypto = require("crypto");
const { apiKeys, project } = require("../models");
const { Op } = require("sequelize");

const apiKeysController = {
  generateKey: async (req, res, next) => {
    try {
      const project_id = req.params.projectId;

      if (!project_id) {
        const err = new Error("This project_id is invalid.");
        err.statusCode = 400;
        err.code = "PROJECT_ID_INAVALID";
        throw err;
      }

      const projectExist = await project.findOne({ where: { id: project_id } });

      if (!projectExist) {
        const err = new Error("This project does not exists.");
        err.statusCode = 404;
        err.code = "PROJECT_NOT_FOUND";
        throw err;
      }

      const rawKey = "notify_ops" + crypto.randomBytes(32).toString("hex");
      const hash_key = crypto.createHash("sha256").update(rawKey).digest("hex");

      const key = await apiKeys.create({
        hash_key,
        proj_id: project_id,
        is_seen: true,
      });

      res.status(201).json({
        api_key: rawKey,
        id: key.id,
        created_at: key.createdAt,
      });
    } catch (error) {
      next(error);
    }
  },
  getAllKeys: async (req, res, next) => {
    try {
      const project_id = req.params.projectId;

      if (!project_id) {
        const err = new Error("This project_id is invalid.");
        err.statusCode = 400;
        err.code = "PROJECT_ID_INAVALID";
        throw err;
      }

      const projectExist = await project.findOne({ where: { id: project_id } });

      if (!projectExist) {
        const err = new Error("This project does not exists.");
        err.statusCode = 404;
        err.code = "PROJECT_NOT_FOUND";
        throw err;
      }

      const keys = await apiKeys.findAll({
        where: {
          proj_id: project_id,
          status: { [Op.in]: ["active", "revoked"] },
        },
      });

      const hiddingKeys = keys.map((key) => {
        key.hash_key = key.hash_key.slice(0, 10) + "•••••••••••••••••••";
        return {
          id: key.id,
          api_key: key.hash_key,
          created_at: key.createdAt,
          status: key.status,
        };
      });

      res.status(200).json({
        data: hiddingKeys,
      });
    } catch (error) {
      next(error);
    }
  },
  revoke: async (req, res, next) => {
    try {
      const id = req.params.id;

      if (!id) {
        const err = new Error("Api key id is missing");
        err.statusCode = 404;
        err.code = "ID_MISSING";
        throw err;
      }

      await apiKeys.update({ status: "revoked" }, { where: { id: id } });
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.params.id;

      if (!id) {
        const err = new Error("Api key id is missing");
        err.statusCode = 404;
        err.code = "ID_MISSING";
        throw err;
      }

      await apiKeys.update({ status: "deleted" }, { where: { id: id } });
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
  makeActive: async (req, res, next) => {
    try {
      const id = req.params.id;

      if (!id) {
        const err = new Error("Api key id is missing");
        err.statusCode = 404;
        err.code = "ID_MISSING";
        throw err;
      }

      await apiKeys.update({ status: "active" }, { where: { id: id } });
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error)
    }
  },
};

module.exports = { apiKeysController };
