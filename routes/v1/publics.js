const { notificationsController } = require("../../controllers/notifications");
const {
  publicRequestValidationMiddleware,
} = require("../../middlewares/publicRequestValidationMiddleware");

const publicRouter = require("express").Router();


publicRouter.use(publicRequestValidationMiddleware);

publicRouter.post(
  "/notifications/send",
  notificationsController.sendOneNotification,
);

publicRouter.post("/notifications/batch", notificationsController.batch);

publicRouter.post("/notifications/send-multi-channel" , notificationsController.multiChannel ) ;


module.exports = { publicRouter };
