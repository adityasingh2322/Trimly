const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL, 
        pass: process.env.SMTP_PASSWORD, 
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'Trimly Admin'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Confirmation email sent successfully: %s', info.messageId);
  } catch (error) {
    console.error('Email could not be sent: ', error.message);
  }
};

module.exports = sendEmail;
