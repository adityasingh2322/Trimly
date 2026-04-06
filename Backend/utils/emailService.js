const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const response = await resend.emails.send({
      from: `${process.env.FROM_NAME || "Trimly"} <onboarding@resend.dev>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    console.log("Email sent:", response.id);
  } catch (error) {
    console.error("Email could not be sent:", error.message);
  }
};

module.exports = sendEmail;