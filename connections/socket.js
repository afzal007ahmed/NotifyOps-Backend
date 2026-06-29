const { Server } = require("socket.io");
const { apiKeys } = require("../models");
const crypto = require("crypto");

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use(async (socket, next) => {
    try {
      const apiKey = socket.handshake.auth?.apiKey;

      if (!apiKey) {
        return next(new Error("API_KEY_MISSING"));
      }

      const hashApiKey = crypto
        .createHash("sha256")
        .update(apiKey)
        .digest("hex");

      const apiKeyExists = await apiKeys.findOne({
        where: {
          hash_key: hashApiKey,
          status: "active",
        },
      });

      if (!apiKeyExists) {
        return next(new Error("INVALID_API_KEY"));
      }

      socket.project_id = apiKeyExists.proj_id;

      return next();
    } catch (err) {
      return next(new Error("AUTH_FAILED"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Merchant connected:", socket.id);

    socket.join(`project_${socket.project_id}`);

    socket.emit("connected", {
      success: true,
      message: "Welcome to NotifyOps.",
      project_id: socket.project_id,
    });

    socket.on("disconnect", () => {
      console.log("Merchant disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = { initializeSocket };