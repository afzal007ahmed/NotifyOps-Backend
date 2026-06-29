const jwt = require("jsonwebtoken");
const { config } = require("../config");

function authMiddleware(req, res, next) {
  try {
    const jwtTokenWithBearer = req.headers.authorization;
    const token = jwtTokenWithBearer?.split(" ")?.[1];
    if (!token) {
      return res.status(401).json({
        code: "AUTH_TOKEN_MISSING",
        message: "please provide auth token.",
      });
    }

    const user = jwt.verify(token, config.jwt.secret);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      code: "AUTH_FAILED",
      message: error.message,
    });
  }
}

module.exports = { authMiddleware };
