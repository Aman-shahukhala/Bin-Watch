const nodemailer = require("nodemailer");

const SENDER_EMAIL = "aman.shahukhala@gmail.com";
const SENDER_PASSWORD = "viuykmsbaxprlnns";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: SENDER_EMAIL, pass: SENDER_PASSWORD },
});

const sendAlertEmail = async (receiverEmail, binId, fillPercent) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to: receiverEmail,
    subject: `Dustbin Alert: ${binId} is Almost Full!`,
    html: `<div style="font-family:Arial;padding:20px;">
             <h2 style="color:#e74c3c;">Dustbin Alert: ${binId}</h2>
             <p>Bin <strong>${binId}</strong> is <strong>${fillPercent}%</strong> full.</p>
             <hr/>
             <small>Sent by BinWatch Pro Management System</small>
           </div>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Alert sent for ${binId} to ${receiverEmail}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] ${binId}:`, err.message);
  }
};

module.exports = { sendAlertEmail };
