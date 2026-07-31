require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Topic = require('../models/Topic');
const ReviewSession = require('../models/ReviewSession');

// realistic DSA/CS topics across 3 subjects
const sampleTopics = [
  // Data Structures
  { name: 'Binary Search Trees', subject: 'Data Structures', reviews: [4, 3, 2, 3, 4, 3, 2, 3, 4] },
  { name: 'Hash Maps collision resolution', subject: 'Data Structures', reviews: [3, 2, 3, 4, 3, 2, 1, 2, 3] },
  { name: 'Heap operations and priority queues', subject: 'Data Structures', reviews: [2, 3, 4, 3, 2, 3, 3, 4, 3] },
  { name: 'Trie prefix matching', subject: 'Data Structures', reviews: [4, 5, 4, 5, 4, 3, 4, 4, 5] },
  { name: 'Graph adjacency list vs matrix', subject: 'Data Structures', reviews: [3, 3, 4, 3, 2, 3, 4, 3, 4] },

  // Algorithms
  { name: 'Quicksort partition logic', subject: 'Algorithms', reviews: [2, 1, 2, 3, 4, 3, 2, 3, 4] },
  { name: 'Dijkstra shortest path', subject: 'Algorithms', reviews: [3, 2, 1, 2, 3, 2, 3, 3, 4] },
  { name: 'Merge sort divide and conquer', subject: 'Algorithms', reviews: [4, 5, 4, 5, 5, 4, 5, 5, 5] },
  { name: 'KMP string matching algorithm', subject: 'Algorithms', reviews: [2, 3, 2, 3, 4, 3, 2, 3, 3] },
  { name: 'Dynamic programming — knapsack', subject: 'Algorithms', reviews: [1, 2, 3, 2, 3, 2, 3, 4, 3] },
  { name: 'Topological sort on DAGs', subject: 'Algorithms', reviews: [3, 4, 3, 2, 3, 3, 4, 3, 4] },

  // System Design
  { name: 'CAP theorem basics', subject: 'System Design', reviews: [4, 3, 4, 5, 4, 5, 4, 4, 5] },
  { name: 'Consistent hashing for sharding', subject: 'System Design', reviews: [2, 3, 2, 1, 2, 3, 2, 3, 2] },
  { name: 'Rate limiting with token bucket', subject: 'System Design', reviews: [3, 4, 3, 3, 4, 3, 4, 4, 3] },
  { name: 'Database indexing strategies', subject: 'System Design', reviews: [3, 2, 3, 4, 3, 2, 3, 3, 4] },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('connected to mongodb');

  // clean existing data
  await User.deleteMany({});
  await Topic.deleteMany({});
  await ReviewSession.deleteMany({});

  // create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  const user = await User.create({
    name: 'Alex Chen',
    email: 'alex@example.com',
    passwordHash,
  });

  const { computeNextReview } = require('../services/spacedRepetition');

  function simulateReview(easeFactor, interval, repetitions, quality) {
    const result = computeNextReview({ easeFactor, interval, repetitions }, quality);
    return { easeFactor: result.easeFactor, interval: result.interval, repetitions: result.repetitions };
  }

  for (const topic of sampleTopics) {
    let ef = 2.5, int = 0, reps = 0;
    const reviewHistory = topic.reviews;

    // apply all but the last review to get the topic into a realistic state
    for (let i = 0; i < reviewHistory.length - 1; i++) {
      const q = reviewHistory[i];
      const result = simulateReview(ef, int, reps, q);
      ef = result.easeFactor;
      int = result.interval;
      reps = result.repetitions;
    }

    // last review is the current state
    const lastRating = reviewHistory[reviewHistory.length - 1];
    const final = simulateReview(ef, int, reps, lastRating);

    // spread reviews over actual past dates (not evenly spaced)
    const baseDaysBack = 30 + Math.floor(Math.random() * 60);
    let dayOffset = baseDaysBack;

    const topicDoc = await Topic.create({
      userId: user._id,
      name: topic.name,
      subject: topic.subject,
      confidence: lastRating,
      easeFactor: final.easeFactor,
      interval: final.interval,
      repetitions: final.repetitions,
      nextReviewDate: new Date(Date.now() + (final.interval * 86400000 * Math.random())),
    });

    // create review sessions spread over past days
    for (let i = 0; i < reviewHistory.length; i++) {
      // skip days irregularly — sometimes 1 day, sometimes 3, sometimes 5
      const gap = [1, 2, 1, 3, 2, 4, 1, 2, 3][i % 9];
      dayOffset -= gap;
      if (dayOffset < 0) dayOffset = 0;

      await ReviewSession.create({
        topicId: topicDoc._id,
        confidenceRating: reviewHistory[i],
        reviewedAt: daysAgo(dayOffset),
      });
    }
  }

  console.log(`seeded ${sampleTopics.length} topics for demo user`);
  console.log('login: alex@example.com / demo123');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
