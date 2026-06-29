const { authController } = require("../controllers/auth");
const { authMiddleware } = require("../middlewares/authMiddleware");

const authRouter = require("express").Router();

authRouter.post("/signup", authController.register);
authRouter.post("/login", authController.login);

authRouter.use(authMiddleware);

authRouter.get("/me", authController.me);

module.exports = { authRouter };
