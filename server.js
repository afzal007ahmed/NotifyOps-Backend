const { app } = require("./app");
const { config } = require("./config");
const { initializeSocket } = require("./connections/socket");
const { sequelize } = require("./models");
const http = require("http");
const { runWorker } = require("./worker/worker");


async function server() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    const server = http.createServer(app);
    const io = initializeSocket(server);
    runWorker(io)
    server.listen(config.port, () =>
      console.log("server is listening at port :", config.port),
    );
  } catch (error) {
    console.log(error.message);
  }
}

server();
