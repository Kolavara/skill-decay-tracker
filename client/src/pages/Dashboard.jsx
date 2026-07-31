import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from 'border-beam';
import { ThinkingOrb } from 'thinking-orbs';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [dueTopics, setDueTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  const fetchDue = () => {
    setLoading(true);
    api.get('/topics/due')
      .then(res => setDueTopics(res.data.topics))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDue(); }, []);



  const reviewTopic = async (topicId, confidence) => {
    setReviewing(topicId);
    try {
      await api.post(`/topics/${topicId}/review`, { confidence });
      await new Promise(r => setTimeout(r, 600));
      setDueTopics(prev => prev.filter(t => t._id !== topicId));
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(null);
    }
  };

  const grouped = dueTopics.reduce((acc, topic) => {
    if (!acc[topic.subject]) acc[topic.subject] = [];
    acc[topic.subject].push(topic);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 gap-4">
        <ThinkingOrb state="solving" size={64} />
        <p className="text-lg font-hand text-pencil/50">checking what's due</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-hand text-pencil flex items-center gap-3" style={{ transform: 'rotate(-0.5deg)' }}>
          <CalendarDays size={36} strokeWidth={2.5} className="text-pencil/60" />
          due today
        </h1>
        <p className="text-lg font-body text-pencil/50 mt-1">
          {dueTopics.length === 0
            ? 'nothing to review right now — nice work'
            : `${dueTopics.length} topic${dueTopics.length !== 1 ? 's' : ''} waiting`}
        </p>
      </div>

      {dueTopics.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle2 size={48} strokeWidth={2} className="text-pencil/30 mx-auto mb-3" />
          <p className="text-xl font-hand text-pencil/40 mb-4">all caught up!</p>
          <Link to="/topics" className="btn-hand px-5 py-2 text-lg font-hand inline-block">
            add more topics
          </Link>
        </div>
      )}

      {dueTopics.length > 0 && (
        <div className="relative">
          <BorderBeam
            size="pulse-outside"
            duration={8}
            colorVariant="ocean"
            theme="light"
            strength={0.35}
          >
            <div className="card-hand p-4">
              <div className="relative deco-tape" />
              <div className="space-y-1 mt-2">
                {Object.entries(grouped).map(([subject, topics]) => (
                  <div key={subject} className="mb-4 last:mb-0">
                    <h2 className="text-sm font-hand text-pencil/50 uppercase tracking-wider mb-2 px-3 pt-3">
                      — {subject}
                    </h2>
                    {topics.map(topic => (
                      <motion.div
                        key={topic._id}
                        layout
                        className="topic-row"
                      >
                        {reviewing === topic._id ? (
                          <div className="flex items-center justify-center gap-3 px-4 py-4">
                            <ThinkingOrb state="solving" size={64} />
                            <span className="text-sm font-hand text-pencil/40">recalculating schedule</span>
                          </div>
                        ) : (
                          <div className="px-4 py-3 flex items-center justify-between hover:bg-postit/50 rounded transition-colors">
                            <div className="min-w-0 mr-4">
                              <Link
                                to={`/topics/${topic._id}`}
                                className="text-lg font-hand text-pencil hover:text-blue transition-colors truncate block"
                              >
                                {topic.name}
                              </Link>
                              <p className="text-sm font-body text-pencil/40 mt-0.5">
                                interval: {topic.interval}d · ease {topic.easeFactor}
                              </p>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              {[1, 2, 3, 4, 5].map(rating => (
                                <motion.button
                                  key={rating}
                                  whileHover={{ scale: 1.12, rotate: rating % 2 === 0 ? 3 : -3 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => reviewTopic(topic._id, rating)}
                                  className="btn-hand w-9 h-9 text-base font-hand flex items-center justify-center"
                                  style={{
                                    borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                                    background: rating <= 2 ? '#ffcccc' : rating === 3 ? '#fff3a0' : '#b8e6b8',
                                  }}
                                >
                                  {rating}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </BorderBeam>
        </div>
      )}
    </div>
  );
}
