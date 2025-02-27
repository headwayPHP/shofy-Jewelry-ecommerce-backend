// require('dotenv').config();
// const nodemailer = require('nodemailer');
// const { secret } = require('./secret');

// // sendEmail
// module.exports.sendEmail = (body, res, message) => {
//   const transporter = nodemailer.createTransport({
//     host: secret.email_host,
//     service: secret.email_service, //comment this line if you use custom server/domain
//     port: secret.email_port,
//     secure: true,
//     auth: {
//       user: secret.email_user,
//       pass: secret.email_pass,
//     },
//   });

//   transporter.verify(function (err, success) {
//     if (err) {
//       res.status(403).send({
//         message: `Error happen when verify ${err.message}`,
//       });
//       console.log(err.message);
//     } else {
//       console.log('Server is ready to take our messages');
//     }
//   });

//   transporter.sendMail(body, (err, data) => {
//     if (err) {
//       res.status(403).send({
//         message: `Error happen when sending email ${err.message}`,
//       });
//     } else {
//       res.send({
//         message: message,
//       });
//     }
//   });
// };



require("dotenv").config();
const nodemailer = require("nodemailer");
const { secret } = require("./secret");

module.exports.sendEmail = (body, callback) => {
  const transporter = nodemailer.createTransport({
    host: secret.email_host,
    service: secret.email_service, // Comment this line if using a custom domain
    port: secret.email_port,
    secure: true,
    auth: {
      user: secret.email_user,
      pass: secret.email_pass,
    },
  });

  // Verify transporter (optional, do not send response here)
  transporter.verify((err, success) => {
    if (err) {
      console.error(`Error verifying email transporter: ${err.message}`);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  // Send the email and use a callback function instead of sending a response directly
  transporter.sendMail(body, (err, info) => {
    if (err) {
      console.error(`Error sending email: ${err.message}`);
      return callback(err, null);
    }
    console.log("Email sent successfully:", info.response);
    return callback(null, info);
  });
};
