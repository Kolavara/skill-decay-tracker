const cron = require('node-cron');
const Topic = require('../models/Topic');
const User = require('../models/User');
const { sendDigestEmail } = require('./email');

// runs every day at 8am
function startCronJobs() {
  cron.schedule('0 8 * * *', async () => {
    console.log('running daily digest cron job');
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const users = await User.find({ emailDigest: true });
      for (const user of users) {
        const dueTopics = await Topic.find({
          userId: user._id,
          nextReviewDate: { $lte: today },
        });

        if (dueTopics.length > 0) {
          await sendDigestEmail(user.email, user.name, dueTopics);
          console.log(`sent digest to ${user.email} — ${dueTopics.length} topics due`);
        }
      }
    } catch (err) {
      console.error('cron job error:', err);
    }
  });
}

module.exports = { startCronJobs };
