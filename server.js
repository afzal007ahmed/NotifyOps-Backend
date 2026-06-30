const { app } = require("./app");
const { config } = require("./config");
const { initializeSocket } = require("./connections/socket");
const { sequelize } = require("./models");
const http = require("http");
const { runWorker } = require("./worker/worker");
const applicationLogger = require("./logger/applicationLogger");


async function server() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    const server = http.createServer(app);
    const io = initializeSocket(server);
    runWorker(io)
    server.listen(config.port, () =>
      applicationLogger.info(`server is listening at port : ${config.port}`),
    );
  } catch (error) {
    applicationLogger.error(error.message);
  }
}

server();
