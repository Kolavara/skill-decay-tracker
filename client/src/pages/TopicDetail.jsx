import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ThinkingOrb } from 'thinking-orbs';
import { ArrowLeft, Calendar, Clock, Gauge, History } from 'lucide-react';
import api from '../api';

const prefersReduced = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function TopicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    api.get(`/topics/${id}`)
      .then(res => {
        setTopic(res.data.topic);
        setReviews(res.data.reviews);
      })
      .catch(() => navigate('/topics'))
      .finally(() => setLoading(false));
  }, [id]);



  const reviewTopic = async (confidence) => {
    setReviewing(true);
    try {
      const res = await api.post(`/topics/${id}/review`, { confidence });
      setTopic(res.data.topic);
      const revRes = await api.get(`/topics/${id}`);
      setReviews(revRes.data.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 gap-4">
        <ThinkingOrb state="searching" size={64} />
        <p className="text-lg font-hand text-pencil/50">loading topic</p>
      </div>
    );
  }

  if (!topic) {
    return <div className="text-xl font-hand text-pencil/40 pt-12 text-center">topic not found</div>;
  }

  const chartData = reviews.map((r, i) => ({
    review: i + 1,
    confidence: r.confidenceRating,
    date: new Date(r.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const nextReview = new Date(topic.nextReviewDate);
  const today = new Date();
  const daysUntil = Math.ceil((nextReview - today) / 86400000);

  return (
    <div>
      <button
        onClick={() => navigate('/topics')}
        className="text-lg font-hand text-pencil/40 hover:text-pencil transition-colors mb-6"
      >
        <ArrowLeft size={18} strokeWidth={2.5} className="inline" /> back to topics
      </button>

      <div className="mb-10">
        <motion.h1
          className="text-4xl md:text-5xl font-hand text-pencil"
          style={{ transform: 'rotate(-0.5deg)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {topic.name}
        </motion.h1>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-base font-body text-pencil/50">
          <span className="px-3 py-0.5 bg-postit border-2 border-pencil/30 font-hand"
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
            {topic.subject}
          </span>
          <span className="inline-flex items-center gap-1"><Clock size={14} strokeWidth={2.5} /> confidence {topic.confidence}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Calendar size={14} strokeWidth={2.5} /> interval {topic.interval}d</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Gauge size={14} strokeWidth={2.5} /> ease factor {topic.easeFactor}</span>
        </div>
        <p className="text-base font-body text-pencil/40 mt-2 inline-flex items-center gap-1">
          <Calendar size={14} strokeWidth={2.5} /> next review: {nextReview.toLocaleDateString()}
          {daysUntil > 0 ? ` (in ${daysUntil} day${daysUntil !== 1 ? 's' : ''})` : ' (today)'}
        </p>
      </div>

      {chartData.length > 1 && (
        <div className="detail-section card-hand p-6 mb-6 relative">
          <div className="deco-tape" />
          <h2 className="text-lg font-hand text-pencil/50 uppercase tracking-wider mb-4 mt-2">
            confidence over time
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="review"
                tick={{ fontSize: 12, fill: '#999', fontFamily: 'Patrick Hand' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12, fill: '#999', fontFamily: 'Patrick Hand' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 14,
                  fontFamily: 'Patrick Hand',
                  borderRadius: '12px 2px 12px 2px',
                  border: '2px solid #2d2d2d',
                  boxShadow: '4px 4px 0px 0px #2d2d2d',
                  background: '#ffffff',
                }}
                formatter={(val) => [`confidence: ${val}`, '']}
                labelFormatter={(label) => `review #${label}`}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#2d5da1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2d5da1', stroke: '#2d2d2d', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="detail-section mb-6">
        <h2 className="text-lg font-hand text-pencil/50 uppercase tracking-wider mb-3">
          review this topic
        </h2>

        {reviewing ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <ThinkingOrb state="solving" size={64} />
            <span className="text-base font-hand text-pencil/40">recalculating your schedule</span>
          </div>
        ) : (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <motion.button
                key={rating}
                whileHover={{ scale: 1.06, y: -3, rotate: rating % 2 === 0 ? 3 : -3 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => reviewTopic(rating)}
                className="flex-1 btn-hand py-3 text-xl font-hand"
                style={{
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  background: rating <= 2 ? '#ffcccc' : rating === 3 ? '#fff3a0' : '#b8e6b8',
                }}
              >
                {rating}
              </motion.button>
            ))}
          </div>
        )}
        <div className="flex justify-between text-sm font-body text-pencil/30 mt-2 px-1">
          <span>forgot</span>
          <span>hard</span>
          <span>okay</span>
          <span>easy</span>
          <span>perfect</span>
        </div>
      </div>

      <div className="detail-section">
        <h2 className="text-lg font-hand text-pencil/50 uppercase tracking-wider mb-3">
          <History size={16} strokeWidth={2.5} className="inline" /> review history
        </h2>
        {reviews.length === 0 ? (
          <p className="text-base font-hand text-pencil/40">no reviews yet</p>
        ) : (
          <div className="space-y-1">
            {[...reviews].reverse().map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between py-2 px-4 font-body text-base hover:bg-postit/50 rounded transition-colors"
                style={{ borderRadius: '2px 8px 2px 8px' }}
              >
                <span className="text-pencil/60">
                  {new Date(r.reviewedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <span className="font-hand font-bold text-lg" style={{
                  color: r.confidenceRating >= 4 ? '#2d5da1' : r.confidenceRating === 3 ? '#b8860b' : '#ff4d4d',
                }}>
                  {r.confidenceRating}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
