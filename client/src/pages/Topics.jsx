import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from 'border-beam';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { ThinkingOrb } from 'thinking-orbs';
import api from '../api';

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', confidence: 3 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const fetchTopics = () => {
    setLoading(true);
    const url = filter ? `/topics?subject=${encodeURIComponent(filter)}` : '/topics';
    api.get(url)
      .then(res => {
        setTopics(res.data.topics);
        const uniqueSubjects = [...new Set(res.data.topics.map(t => t.subject))];
        setSubjects(uniqueSubjects);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTopics(); }, [filter]);



  const addTopic = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/topics', {
        name: form.name,
        subject: form.subject,
        confidence: parseInt(form.confidence),
      });
      setForm({ name: '', subject: '', confidence: 3 });
      setShowForm(false);
      fetchTopics();
    } catch (err) {
      setFormError(err.response?.data?.error || 'failed to add topic');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTopic = async (id) => {
    if (!confirm('delete this topic?')) return;
    try {
      await api.delete(`/topics/${id}`);
      setTopics(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const isDue = (t) => new Date(t.nextReviewDate) <= new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-hand text-pencil" style={{ transform: 'rotate(-0.5deg)' }}>
            all topics
          </h1>
          <p className="text-lg font-body text-pencil/50 mt-1">{topics.length} total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-hand px-5 py-2 text-lg font-hand"
        >
          {showForm ? 'cancel' : <><Plus size={18} strokeWidth={2.5} /> add topic</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={addTopic}
            className="overflow-hidden mb-6"
          >
            <div className="card-hand p-5 space-y-4 relative">
              <div className="deco-tack" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="sm:col-span-2">
                  <label className="block text-lg font-hand text-pencil mb-1">topic name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      required
                      placeholder="e.g. Binary Search Trees"
                      className="w-full input-hand text-lg"
                    />
                    {inputFocused && (
                      <BorderBeam
                        size="sm"
                        duration={5}
                        colorVariant="mono"
                        theme="light"
                        strength={0.3}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-hand text-pencil mb-1">subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required
                    placeholder="e.g. Data Structures"
                    className="w-full input-hand text-lg"
                  />
                </div>
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <label className="block text-lg font-hand text-pencil mb-1">confidence</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(r => (
                      <motion.button
                        key={r}
                        type="button"
                        whileHover={{ scale: 1.08, rotate: r % 2 === 0 ? 2 : -2 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setForm(f => ({ ...f, confidence: r }))}
                        className="btn-hand w-10 h-10 text-base font-hand flex items-center justify-center"
                        style={{
                          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                          background: r === form.confidence ? '#ff4d4d' : '#ffffff',
                          color: r === form.confidence ? '#ffffff' : '#2d2d2d',
                        }}
                      >
                        {r}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-hand px-5 py-2 text-lg font-hand"
                >
                  {submitting ? 'adding...' : 'add →'}
                </motion.button>
              </div>
              {formError && (
                <p className="text-sm font-hand text-accent">{formError}</p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {subjects.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className="text-lg font-hand px-3 py-1 border-2 border-pencil/30 hover:border-pencil transition-colors"
            style={{
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              background: !filter ? '#fff9c4' : 'transparent',
            }}
          >
            all
          </button>
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="text-lg font-hand px-3 py-1 border-2 border-pencil/30 hover:border-pencil transition-colors"
              style={{
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                background: filter === s ? '#fff9c4' : 'transparent',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center pt-12 gap-4">
          <ThinkingOrb state="searching" size={64} />
          <p className="text-xl font-hand text-pencil/50 text-center">loading topics...</p>
        </div>
      ) : topics.length === 0 ? (
        <p className="text-xl font-hand text-pencil/40 pt-8 text-center">no topics yet</p>
      ) : (
        <div className="space-y-3">
          {topics.map((t, i) => (
            <motion.div
              key={t._id}
              layout
              className="topic-item card-hand px-5 py-4 flex items-center justify-between"
              style={{ transform: `rotate(${i % 3 === 0 ? -0.3 : i % 3 === 1 ? 0.2 : 0}deg)` }}
            >
              <Link to={`/topics/${t._id}`} className="min-w-0 mr-4 flex-1">
                <div className="flex items-center gap-3">
                  <BookOpen size={18} strokeWidth={2.5} className="text-pencil/40 flex-shrink-0" />
                  <span className="text-lg font-hand text-pencil hover:text-blue transition-colors truncate">
                    {t.name}
                  </span>
                  {isDue(t) && (
                    <span className="text-sm px-2 py-0.5 bg-accent text-white font-hand border-2 border-pencil"
                      style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
                      due!
                    </span>
                  )}
                </div>
                <p className="text-sm font-body text-pencil/70 mt-0.5">
                  {t.subject} · confidence {t.confidence} · interval {t.interval}d
                </p>
              </Link>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteTopic(t._id)}
                className="text-sm font-hand text-pencil/30 hover:text-accent transition-colors flex-shrink-0 inline-flex items-center gap-1"
              >
                <Trash2 size={14} strokeWidth={2.5} /> remove
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
