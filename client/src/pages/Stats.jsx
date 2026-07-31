import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Target, Flame, Award, ListChecks, BarChart3, ShieldAlert, Sparkles, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { ThinkingOrb } from 'thinking-orbs';
import api from '../api';

const BAR_COLORS = ['#2d5da1', '#ff4d4d', '#e2a63d', '#4caf50', '#8e44ad', '#16a085'];

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 gap-4">
        <ThinkingOrb state="solving" size={64} />
        <p className="text-xl font-hand text-pencil/50">analyzing your memory retention...</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-xl font-hand text-pencil/40 pt-12 text-center">failed to load stats</div>;
  }

  const {
    retentionPct = 0,
    streak = 0,
    mastered = 0,
    totalReviews = 0,
    avgInterval = 1,
    decayStatus = { overdue: 0, dueSoon: 0, fresh: 0, mastered: 0 },
    subjects = [],
    confidenceDistribution = [],
    recentActivity = [],
    totalTopics = 0,
  } = stats;

  // Calculate percentages for decay status bar
  const totalDecayTopics = totalTopics || 1;
  const overduePct = Math.round(((decayStatus.overdue || 0) / totalDecayTopics) * 100);
  const dueSoonPct = Math.round(((decayStatus.dueSoon || 0) / totalDecayTopics) * 100);
  const freshPct = Math.round(((decayStatus.fresh || 0) / totalDecayTopics) * 100);
  const masteredPct = Math.round(((decayStatus.mastered || 0) / totalDecayTopics) * 100);

  return (
    <div className="space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-hand text-pencil" style={{ transform: 'rotate(-0.5deg)' }}>
            learning analytics
          </h1>
          <p className="font-body text-pencil/60 text-lg mt-1">
            real-time memory retention, decay health, and study trends.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-postit border-2 border-pencil/30 text-pencil font-hand text-lg" style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
          <Sparkles size={18} className="text-accent" />
          <span>{totalTopics} total topics tracked</span>
        </div>
      </motion.div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="retention" value={`${retentionPct}%`} icon={Target} index={0} rotation={-1.5} sub="overall accuracy" />
        <StatCard label="streak" value={`${streak}d`} icon={Flame} index={1} rotation={0.8} sub="daily consistency" />
        <StatCard label="mastered" value={mastered} icon={Award} index={2} rotation={-0.5} sub=">30 days interval" />
        <StatCard label="total reviews" value={totalReviews} icon={ListChecks} index={3} rotation={1.2} sub="sessions completed" />
        <StatCard label="avg interval" value={`${avgInterval}d`} icon={Clock} index={4} rotation={-1} sub="memory retention gap" />
      </div>

      {/* Memory Decay Health Status Section */}
      <motion.div
        className="card-hand p-6 relative bg-white"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="deco-tack" />
        <div className="flex items-center justify-between mb-3 mt-2">
          <h2 className="text-xl font-hand text-pencil flex items-center gap-2">
            <ShieldAlert size={20} strokeWidth={2.5} className="text-accent" />
            memory decay health
          </h2>
          <span className="font-hand text-sm text-pencil/50">topic breakdown</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-6 w-full bg-paper border-2 border-pencil rounded-lg overflow-hidden flex shadow-inner my-3">
          <div className="bg-[#ff4d4d] h-full transition-all duration-500" style={{ width: `${overduePct}%` }} title={`Overdue: ${decayStatus.overdue}`} />
          <div className="bg-[#e2a63d] h-full transition-all duration-500" style={{ width: `${dueSoonPct}%` }} title={`Due Soon: ${decayStatus.dueSoon}`} />
          <div className="bg-[#2d5da1] h-full transition-all duration-500" style={{ width: `${freshPct}%` }} title={`Fresh: ${decayStatus.fresh}`} />
          <div className="bg-[#4caf50] h-full transition-all duration-500" style={{ width: `${masteredPct}%` }} title={`Mastered: ${decayStatus.mastered}`} />
        </div>

        {/* Status Legend Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3 border-2 border-pencil/20 rounded-md bg-[#ff4d4d]/10 flex items-center justify-between">
            <span className="font-hand text-pencil font-bold text-base flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff4d4d] border border-pencil inline-block" /> Overdue
            </span>
            <span className="font-hand text-pencil text-lg font-bold">{decayStatus.overdue}</span>
          </div>
          <div className="p-3 border-2 border-pencil/20 rounded-md bg-[#e2a63d]/10 flex items-center justify-between">
            <span className="font-hand text-pencil font-bold text-base flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#e2a63d] border border-pencil inline-block" /> Due Soon
            </span>
            <span className="font-hand text-pencil text-lg font-bold">{decayStatus.dueSoon}</span>
          </div>
          <div className="p-3 border-2 border-pencil/20 rounded-md bg-[#2d5da1]/10 flex items-center justify-between">
            <span className="font-hand text-pencil font-bold text-base flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2d5da1] border border-pencil inline-block" /> Fresh
            </span>
            <span className="font-hand text-pencil text-lg font-bold">{decayStatus.fresh}</span>
          </div>
          <div className="p-3 border-2 border-pencil/20 rounded-md bg-[#4caf50]/10 flex items-center justify-between">
            <span className="font-hand text-pencil font-bold text-base flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#4caf50] border border-pencil inline-block" /> Mastered
            </span>
            <span className="font-hand text-pencil text-lg font-bold">{decayStatus.mastered}</span>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid: 14-day activity & Subjects */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 14-Day Activity History */}
        <motion.div
          className="card-hand p-6 relative bg-white"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="deco-tape" />
          <h2 className="text-xl font-hand text-pencil mb-4 mt-2 flex items-center gap-2">
            <Calendar size={20} strokeWidth={2.5} className="text-blue" />
            14-day review activity
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={recentActivity}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d5da1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2d5da1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666', fontFamily: 'Patrick Hand' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#666', fontFamily: 'Patrick Hand' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: 14,
                  fontFamily: 'Patrick Hand',
                  borderRadius: '8px',
                  border: '2px solid #2d2d2d',
                  boxShadow: '3px 3px 0px 0px #2d2d2d',
                  background: '#ffffff',
                }}
                formatter={(val) => [`${val} reviews completed`, 'Count']}
              />
              <Area type="monotone" dataKey="count" stroke="#2d5da1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Topics by Subject Chart */}
        <motion.div
          className="card-hand p-6 relative bg-white"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="deco-tape" />
          <h2 className="text-xl font-hand text-pencil mb-4 mt-2 flex items-center gap-2">
            <BarChart3 size={20} strokeWidth={2.5} className="text-pencil" />
            topics by subject
          </h2>
          {subjects.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjects}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666', fontFamily: 'Patrick Hand' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#666', fontFamily: 'Patrick Hand' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 14,
                    fontFamily: 'Patrick Hand',
                    borderRadius: '8px',
                    border: '2px solid #2d2d2d',
                    boxShadow: '3px 3px 0px 0px #2d2d2d',
                    background: '#ffffff',
                  }}
                  formatter={(val) => [`${val} topics`, 'Total']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {subjects.map((entry, index) => (
                    <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center font-hand text-pencil/40 text-lg">
              no topics added yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Confidence Distribution & Study Tip */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Confidence rating breakdown */}
        <motion.div
          className="md:col-span-2 card-hand p-6 bg-white relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-hand text-pencil mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} strokeWidth={2.5} className="text-accent" />
            confidence rating distribution
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={confidenceDistribution} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12, fill: '#666', fontFamily: 'Patrick Hand' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="rating" type="category" tick={{ fontSize: 14, fill: '#2d2d2d', fontFamily: 'Patrick Hand' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{
                  fontSize: 14,
                  fontFamily: 'Patrick Hand',
                  borderRadius: '8px',
                  border: '2px solid #2d2d2d',
                  boxShadow: '3px 3px 0px 0px #2d2d2d',
                  background: '#ffffff',
                }}
                formatter={(val) => [`${val} reviews`, 'Count']}
              />
              <Bar dataKey="count" fill="#e2a63d" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Personalized Hand-Drawn Post-it Insight */}
        <motion.div
          className="postit p-6 relative flex flex-col justify-between"
          style={{ transform: 'rotate(1deg)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="deco-tape" />
          <div>
            <h3 className="text-xl font-hand text-pencil font-bold mb-2 flex items-center gap-1.5">
              💡 study tip
            </h3>
            <p className="font-body text-pencil/80 text-lg leading-snug">
              {(() => {
                if (decayStatus.overdue > 5) {
                  return `🚨 Memory Emergency! You have ${decayStatus.overdue} overdue topics. Tackle them now before the forgetting curve resets completely.`;
                } else if (decayStatus.overdue > 0) {
                  return `You have ${decayStatus.overdue} overdue topic${decayStatus.overdue > 1 ? 's' : ''}. A quick 5-minute review session right now will lock them back into your long-term memory.`;
                } else if (streak >= 7) {
                  return `🔥 ${streak}-day streak! Consistency is the ultimate cheat code for the brain. Don't break the chain!`;
                } else if (mastered >= 10) {
                  return `🏆 Awesome! You have ${mastered} mastered topics pushed past the 30-day interval. That's pure long-term memory right there.`;
                } else if (retentionPct >= 90) {
                  return `🧠 Big brain energy! Your retention is at ${retentionPct}%. You've mastered your schedule. Time to learn something new?`;
                } else if (retentionPct >= 70 && totalReviews > 10) {
                  return `Your retention is holding steady at ${retentionPct}%. Try testing yourself on topics you find difficult to bump that score up!`;
                } else if (retentionPct < 70 && totalReviews > 5) {
                  return `Your overall retention is ${retentionPct}%. Don't guess during reviews! If you don't know it, rate it a 1 or 2 so the SM-2 algorithm can save you.`;
                }
                return "Consistent 2-minute daily reviews build stronger memory traces than weekend cramming!";
              })()}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-pencil/20 font-hand text-sm text-pencil/60">
            SM-2 algorithm active · Spaced Repetition Engine
          </div>
        </motion.div>
      </div>

      <div className="mt-4 text-base font-body text-pencil/50 text-center">
        <p>retention = average confidence across all reviews · mastered = review interval &gt; 30 days</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, index, rotation = 0, sub }) {
  return (
    <motion.div
      className="card-hand px-4 py-4 relative bg-white"
      style={{ transform: `rotate(${rotation}deg)` }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={16} strokeWidth={2.5} className="text-pencil/50" />
        <p className="text-xs font-hand text-pencil/50 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-hand text-pencil mt-1 font-bold">{value}</p>
      {sub && <p className="text-xs font-body text-pencil/40 mt-0.5">{sub}</p>}
    </motion.div>
  );
}
