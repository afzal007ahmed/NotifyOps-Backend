const { config } = require("../config");
const { organisation, users, limits, usage } = require("../models");
const { parseRegisterPayload, parseLoginPayload } = require("../utils/helper");
const { registerSchema, loginSchema } = require("../validations/zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const authController = {
  register: async (req, res, next) => {
    try {
      const body = parseRegisterPayload(req.body);
      const result = registerSchema.safeParse(body);

      if (!result.success) {
        const Err = new Error(result.error.issues[0].message);
        Err.statusCode = 400;
        Err.code = "INVALID_DATA";
        throw Err;
      }
      const { orgName, ...userDetails } = body;
      const org = await organisation.findOne({
        where: { name: orgName.trim() },
      });
      if (org) {
        const Err = new Error(
          "organisation is already registered. Please login with the existing credentials. Ask your organisation owner for more details.",
        );
        Err.statusCode = 409;
        Err.code = "ORG_EXISTS";
        throw Err;
      }

      const userExist = await users.findOne({
        where: { email: userDetails.email },
      });

      if (userExist) {
        const Err = new Error("User already exists.Please login.");
        Err.statusCode = 409;
        Err.code = "USER_EXISTS";
        throw Err;
      }

      const hashedPassword = await bcrypt.hash(userDetails.password, 10);
      userDetails.password = hashedPassword;

      const newOrg = await organisation.create({
        name: orgName,
      });

      await limits.create({
        org_id: newOrg.id,
        email_limit: 500,
        sms_limit: 10,
        inapp_limit: 500,
      });

      await usage.create({
        org_id: newOrg.id,
        email_count: 0,
        sms_count: 0,
        inapp_count: 0,
      });

      const user = await users.create({ ...userDetails, org_id: newOrg.id });

      const token = jwt.sign(
        { id: user.id, role: user.role, org_id: user.org_id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiry },
      );

      res.status(201).json({
        data: { name: user.name, email: user.email, id: user.id },
        token: token,
      });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const body = parseLoginPayload(req.body);
      const result = loginSchema.safeParse(body);

      if (!result.success) {
        const Err = new Error(result.error.issues[0].message);
        Err.statusCode = 400;
        Err.code = "INVALID_DATA";
        throw Err;
      }

      const user = await users.findOne({ where: { email: body.email } });
      if (!user) {
        const Err = new Error("User not found");
        Err.statusCode = 404;
        Err.code = "USER_NOT_FOUND";
        throw Err;
      }

      if (!(await bcrypt.compare(body.password, user.password))) {
        const Err = new Error("Password mismatch.");
        Err.statusCode = 400;
        Err.code = "PASSWORD_MISMATCH";
        throw Err;
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, org_id: user.org_id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiry },
      );

      res.status(200).json({
        token,
        data: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  me: async (req, res, next) => {
    try {
      const user = req.user;
      const userDetails = await users.findOne({
        where: { id: user.id },
        attributes: ["name", "email", "role", "org_id", "id"],
      });
      if (!userDetails) {
        const err = new Error("User not found");
        err.statusCode = 404;
        err.code = "USER_NOT_FOUND";
        throw err;
      }
      const { password, ...updatedDetails } = userDetails;
      res.status(200).json({
        data: updatedDetails,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { authController };
