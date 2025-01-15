const sgMail = require('@sendgrid/mail')

const sendEmail = async ({ to, subject, html }) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to,
        from: 'firasdev74@gmail.com', // Change to your verified sender
        subject,
        html,
    }
    await sgMail.send(msg);
}

module.exports = sendEmail;