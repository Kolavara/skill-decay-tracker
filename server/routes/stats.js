const express = require('express');
const auth = require('../middleware/auth');
const Topic = require('../models/Topic');
const ReviewSession = require('../models/ReviewSession');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const topics = await Topic.find({ userId: req.userId });

    // retention = average confidence across all reviews
    const allReviews = await ReviewSession.find({
      topicId: { $in: topics.map(t => t._id) },
    });
    const avgConfidence = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.confidenceRating, 0) / allReviews.length
      : 0;
    const retentionPct = Math.round((avgConfidence / 5) * 100);

    // mastered = topics with interval > 30 days
    const mastered = topics.filter(t => t.interval > 30).length;

    // streak = consecutive days with at least one review, counting back from today
    const reviewDates = [...new Set(
      allReviews.map(r => r.reviewedAt.toISOString().split('T')[0])
    )].sort().reverse();

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (reviewDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // subjects breakdown
    const subjectMap = {};
    topics.forEach(t => {
      subjectMap[t.subject] = (subjectMap[t.subject] || 0) + 1;
    });
    const subjects = Object.entries(subjectMap).map(([name, count]) => ({ name, count }));

    res.json({
      totalTopics: topics.length,
      retentionPct,
      streak,
      mastered,
      subjects,
      totalReviews: allReviews.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
