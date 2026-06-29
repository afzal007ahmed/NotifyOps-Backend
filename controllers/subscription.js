const { subscription } = require("../models");

const subscriptionController = {
  getPlans: async (req, res, next) => {
    try {
      const plans = await subscription.findAll();
      res.status(200).json({
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  },
};



module.exports = { subscriptionController } ;