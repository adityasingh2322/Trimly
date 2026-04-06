const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Trimly'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: "adityasingh04092006@gmail.com",
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Resend error:', error);
      return;
    }

    console.log('Email sent:', data.id);
  } catch (err) {
    console.error('Email could not be sent:', err.message);
  }
};

module.exports = sendEmail;
