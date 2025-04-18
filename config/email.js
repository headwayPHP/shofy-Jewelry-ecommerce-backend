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



// require("dotenv").config();
// const nodemailer = require("nodemailer");
// const { secret } = require("./secret");

// module.exports.sendEmail = (body, callback) => {
//   const transporter = nodemailer.createTransport({
//     host: secret.email_host,
//     service: secret.email_service, // Comment this line if using a custom domain
//     port: secret.email_port,
//     secure: true,
//     auth: {
//       user: secret.email_user,
//       pass: secret.email_pass,
//     },
//   });

//   // Verify transporter (optional, do not send response here)
//   transporter.verify((err, success) => {
//     if (err) {
//       console.error(`Error verifying email transporter: ${err.message}`);
//     } else {
//       console.log("Server is ready to take our messages");
//     }
//   });

//   // Send the email and use a callback function instead of sending a response directly
//   transporter.sendMail(body, (err, info) => {
//     if (err) {
//       console.error(`Error sending email: ${err.message}`);
//       return callback(err, null);
//     }
//     console.log("Email sent successfully:", info.response);
//     return callback(null, info);
//   });
// };

// module.exports.sendEmail = (body, callback = () => { }) => {  // Default callback
//   const transporter = nodemailer.createTransport({
//     host: secret.email_host,
//     port: secret.email_port,
//     secure: secret.email_port == 465, // SSL if port 465
//     auth: {
//       user: secret.email_user,
//       pass: secret.email_pass,
//     },
//     tls: { rejectUnauthorized: false }, // Prevents TLS-related errors
//   });

//   transporter.sendMail(body, (err, info) => {
//     if (err) {
//       console.error(`Error sending email: ${err.message}`);
//       return callback(err, null);
//     }
//     console.log("Email sent successfully:", info.response);
//     return callback(null, info);
//   });
// };


const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === "true", // SSL (true) or TLS (false)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        minVersion: 'TLSv1.2',  // Force modern TLS version
        rejectUnauthorized: false,  // Prevent certificate issues
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"Headway" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent: ${info.response}`);
        return info;
    } catch (error) {
        console.error(`❌ Error sending email: ${error.message}`);
        throw error;
    }
};

module.exports = { sendEmail };
