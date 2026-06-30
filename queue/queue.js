const { Queue } = require("bullmq");
const { connection } = require("../connections/redis");

const queue = new Queue("notifications", {
  connection: connection,
  prefix : "{bull}",
  defaultJobOptions : {
    attempts : 3 , 
    backoff : {
      type : "exponential" ,
      delay : 5000
    }
  }
});


module.exports = { queue }