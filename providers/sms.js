const uuid = require("uuid");

const sendSms = () => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      const value = Math.random();
      const messageId = uuid.v4();
      if (value > 0.5) {
        res({
          messageId: messageId,
          success: true,
        });
      } else {
        rej({
          messageId: messageId,
          success: false,
        });
      }
    }, 200);
  });
};

module.exports = { sendSms };
