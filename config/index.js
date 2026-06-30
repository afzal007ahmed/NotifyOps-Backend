require("dotenv").config();

const config = {
  port: process.env.PORT,
  database: {
    name: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    user: process.env.MASTER_USER,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  cors: {
    origin: process.env.ORIGIN,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.TOKEN_EXPIRY + "d",
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  gmail: {
    appPassword: process.env.GMAIL_APP_PASS,
  },
};

module.exports = { config };
