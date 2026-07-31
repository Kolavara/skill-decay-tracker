const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    console.log('SMTP not configured — email digest disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendDigestEmail(to, name, dueTopics) {
  const transport = getTransporter();
  if (!transport) return;

  const topicList = dueTopics
    .map(t => `  - ${t.name} (${t.subject})`)
    .join('\n');

  await transport.sendMail({
    from: '"Skill Decay Tracker" <noreply@localhost>',
    to,
    subject: `You have ${dueTopics.length} topics to review`,
    text: `Hi ${name},\n\nThe following topics are due for review today:\n\n${topicList}\n\nOpen the app to review them.`,
  });
}

module.exports = { sendDigestEmail };
