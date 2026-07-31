/**
 * SM-2 spaced repetition algorithm.
 *
 * Maps a confidence rating (1-5) to SM-2's quality scale (0-5):
 *   1 → 0  (complete blackout)
 *   2 → 2  (incorrect, remembered after seeing answer)
 *   3 → 3  (incorrect, but easy to recall)
 *   4 → 4  (correct with some hesitation)
 *   5 → 5  (perfect recall)
 *
 * Returns updated { easeFactor, interval, repetitions, nextReviewDate }.
 */
function computeNextReview(topic, confidenceRating) {
  const q = mapConfidenceToQuality(confidenceRating);
  let { easeFactor, interval, repetitions } = topic;

  if (q >= 3) {
    // correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // incorrect — reset
    repetitions = 0;
    interval = 1;
  }

  // update ease factor per SM-2 formula
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReviewDate,
  };
}

function mapConfidenceToQuality(rating) {
  const map = { 1: 0, 2: 2, 3: 3, 4: 4, 5: 5 };
  return map[rating] ?? 3;
}

module.exports = { computeNextReview, mapConfidenceToQuality };
