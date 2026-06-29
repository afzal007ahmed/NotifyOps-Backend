require("dotenv").config();

const config = {
  port: process.env.PORT,
  database: {
    url: process.env.URL,
    dialect: "postgres",
  },
  cors: {
    origin: process.env.ORIGIN,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.TOKEN_EXPIRY + "d",
  },
  redis : {
    host : process.env.REDIS_HOST ,
    port : process.env.REDIS_PORT
  },
  gmail : {
    appPassword : process.env.GMAIL_APP_PASS
  }
};

module.exports = { config };
