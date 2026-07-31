const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Topic = require('../models/Topic');
const ReviewSession = require('../models/ReviewSession');
const { computeNextReview } = require('../services/spacedRepetition');

const router = express.Router();

// all routes here require auth
router.use(auth);

// list all topics, optionally filter by subject
router.get('/', async (req, res, next) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }
    const topics = await Topic.find(filter).sort({ nextReviewDate: 1 });
    res.json({ topics });
  } catch (err) {
    next(err);
  }
});

// topics due for review today
router.get('/due', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const topics = await Topic.find({
      userId: req.userId,
      nextReviewDate: { $lte: today },
    }).sort({ nextReviewDate: 1 });
    res.json({ topics });
  } catch (err) {
    next(err);
  }
});

// single topic with review history
router.get('/:id', async (req, res, next) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, userId: req.userId });
    if (!topic) {
      return res.status(404).json({ error: 'topic not found' });
    }
    const reviews = await ReviewSession.find({ topicId: topic._id }).sort({ reviewedAt: 1 });
    res.json({ topic, reviews });
  } catch (err) {
    next(err);
  }
});

// create topic
router.post('/', [
  body('name').trim().notEmpty().withMessage('topic name is required'),
  body('subject').trim().notEmpty().withMessage('subject is required'),
  body('confidence').isInt({ min: 1, max: 5 }).withMessage('confidence must be 1-5'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, subject, confidence } = req.body;

    // compute initial schedule
    const schedule = computeNextReview(
      { easeFactor: 2.5, interval: 0, repetitions: 0 },
      confidence
    );

    const topic = await Topic.create({
      userId: req.userId,
      name,
      subject,
      confidence,
      ...schedule,
    });

    // log initial review
    await ReviewSession.create({
      topicId: topic._id,
      confidenceRating: confidence,
    });

    res.status(201).json({ topic });
  } catch (err) {
    next(err);
  }
});

// delete topic
router.delete('/:id', async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!topic) {
      return res.status(404).json({ error: 'topic not found' });
    }
    await ReviewSession.deleteMany({ topicId: req.params.id });
    res.json({ message: 'deleted' });
  } catch (err) {
    next(err);
  }
});

// review a topic — log confidence, recompute schedule
router.post('/:id/review', [
  body('confidence').isInt({ min: 1, max: 5 }).withMessage('confidence must be 1-5'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const topic = await Topic.findOne({ _id: req.params.id, userId: req.userId });
    if (!topic) {
      return res.status(404).json({ error: 'topic not found' });
    }

    const { confidence } = req.body;
    const schedule = computeNextReview(topic, confidence);

    // update topic
    Object.assign(topic, schedule, { confidence });
    await topic.save();

    // log review session
    await ReviewSession.create({
      topicId: topic._id,
      confidenceRating: confidence,
    });

    res.json({ topic });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
