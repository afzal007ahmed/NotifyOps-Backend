const { organisation, usage } = require("../models");

const organisationController = {
  getOrganisationById: async (req, res, next) => {
    try {
      const orgDetails = await organisation.findOne({
        where: { id: req.user.org_id },
      });

      res.status(200).json({
        data: orgDetails,
      });
    } catch (error) {
      next(error);
    }
  },
  usage: async (req, res, next) => {
    try {

      const usageData = await usage.findOne({
        where: { org_id: req.user.org_id },
      });
      res.status(200).json({
        data: usageData,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { organisationController };
