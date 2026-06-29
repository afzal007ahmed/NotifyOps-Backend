const { subscriptionController } = require("../../controllers/subscription");

const subscriptionRouter = require("express").Router();

subscriptionRouter.get('/' , subscriptionController.getPlans ) ;


module.exports = { subscriptionRouter };
