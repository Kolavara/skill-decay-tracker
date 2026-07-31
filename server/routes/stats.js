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

    // decay status breakdown
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    let overdueCount = 0;
    let dueSoonCount = 0;
    let freshCount = 0;
    let masteredCount = 0;

    topics.forEach(t => {
      if (t.interval > 30) {
        masteredCount++;
      } else if (new Date(t.nextReviewDate) <= now) {
        overdueCount++;
      } else if (new Date(t.nextReviewDate) <= threeDaysFromNow) {
        dueSoonCount++;
      } else {
        freshCount++;
      }
    });

    const decayStatus = {
      overdue: overdueCount,
      dueSoon: dueSoonCount,
      fresh: freshCount,
      mastered: masteredCount,
    };

    // confidence rating distribution (1 to 5)
    const confidenceCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach(r => {
      if (r.confidenceRating >= 1 && r.confidenceRating <= 5) {
        confidenceCounts[r.confidenceRating]++;
      }
    });
    const confidenceDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating: `★ ${rating}`,
      count: confidenceCounts[rating],
    }));

    // 14-day review activity history
    const toLocalDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const activityMap = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = toLocalDateString(d);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      activityMap[key] = { date: label, count: 0 };
    }

    allReviews.forEach(r => {
      const dateKey = toLocalDateString(r.reviewedAt);
      if (activityMap[dateKey]) {
        activityMap[dateKey].count += 1;
      }
    });

    const recentActivity = Object.values(activityMap);

    // average interval (in days)
    const avgInterval = topics.length > 0
      ? Math.round(topics.reduce((sum, t) => sum + (t.interval || 1), 0) / topics.length)
      : 0;

    res.json({
      totalTopics: topics.length,
      retentionPct,
      streak,
      mastered,
      subjects,
      totalReviews: allReviews.length,
      decayStatus,
      confidenceDistribution,
      recentActivity,
      avgInterval,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
