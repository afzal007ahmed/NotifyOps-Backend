const { config } = require("../config");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "afzalahmeddc@gmail.com",
    pass: config.gmail.appPassword,
  },
});

const sendEmail = async (templateBody, templateTitle, to) => {
  const response = await transporter.sendMail({
    from: "afzalahmeddc@gmail.com",
    to,
    subject: templateTitle,
    html: templateBody,
  });
  return response;
};

module.exports = { sendEmail };
