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
    secure: false,
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

  const topicRows = dueTopics
    .map(
      (t) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px dashed #e5e0d8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #2d2d2d;">
          <strong>${t.name}</strong>
          <br/>
          <span style="font-size: 13px; color: #888;">${t.subject} · interval ${t.interval}d</span>
        </td>
      </tr>`
    )
    .join('');

  const topicListText = dueTopics
    .map((t) => `  • ${t.name} (${t.subject})`)
    .join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0; padding:0; background-color:#fdfbf7; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width:520px; margin:32px auto; background:#ffffff; border:2px solid #2d2d2d; border-radius:12px; overflow:hidden; box-shadow: 6px 6px 0px 0px #2d2d2d;">
    
    <!-- Header -->
    <div style="background:#ff4d4d; padding:24px 28px; text-align:center;">
      <h1 style="margin:0; color:#ffffff; font-size:22px; letter-spacing:0.5px;">
        🧠 Skill Decay Tracker
      </h1>
      <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
        Daily Review Digest
      </p>
    </div>

    <!-- Body -->
    <div style="padding:24px 28px;">
      <p style="font-size:16px; color:#2d2d2d; margin:0 0 6px;">
        Hi <strong>${name}</strong>,
      </p>
      <p style="font-size:15px; color:#555; margin:0 0 20px; line-height:1.5;">
        You have <strong style="color:#ff4d4d;">${dueTopics.length}</strong> topic${dueTopics.length === 1 ? '' : 's'} due for review today. Don't let your hard work fade — a quick review keeps your memory sharp!
      </p>

      <!-- Topics Table -->
      <table width="100%" cellspacing="0" cellpadding="0" style="border:2px solid #2d2d2d; border-radius:8px; overflow:hidden; margin-bottom:24px;">
        <tr>
          <td style="background:#fff9c4; padding:10px 16px; font-size:13px; font-weight:bold; color:#2d2d2d; border-bottom:2px solid #2d2d2d; text-transform:uppercase; letter-spacing:1px;">
            📋 Topics Due Today
          </td>
        </tr>
        ${topicRows}
      </table>

      <!-- CTA Button -->
      <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
           style="display:inline-block; background:#ff4d4d; color:#ffffff; text-decoration:none; padding:14px 32px; font-size:16px; font-weight:bold; border:2px solid #2d2d2d; border-radius:8px; box-shadow:3px 3px 0px 0px #2d2d2d;">
          Review Now →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#fdfbf7; padding:16px 28px; border-top:2px dashed #e5e0d8; text-align:center;">
      <p style="margin:0; font-size:12px; color:#999; line-height:1.5;">
        You're receiving this because you have email digests enabled.
        <br/>Toggle this off in the notification bell on the app.
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${name},\n\nYou have ${dueTopics.length} topic(s) due for review today:\n\n${topicListText}\n\nOpen the app to review them: ${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard\n\nYou're receiving this because you have email digests enabled. Toggle it off in the notification bell.`;

  await transport.sendMail({
    from: `"Skill Decay Tracker" <${process.env.SMTP_USER}>`,
    to,
    subject: `📚 You have ${dueTopics.length} topic${dueTopics.length === 1 ? '' : 's'} to review today`,
    text,
    html,
  });
}

module.exports = { sendDigestEmail };
