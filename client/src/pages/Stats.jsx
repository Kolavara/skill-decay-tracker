import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, Flame, Award, ListChecks, BarChart3 } from 'lucide-react';
import api from '../api';

const BAR_COLORS = ['#2d5da1', '#ff4d4d', '#e2a63d', '#4caf50'];

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
        <p className="text-xl font-hand text-pencil/50">loading stats...</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-xl font-hand text-pencil/40 pt-12 text-center">failed to load stats</div>;
  }

  return (
    <div>
      <motion.h1
        className="text-4xl md:text-5xl font-hand text-pencil mb-8"
        style={{ transform: 'rotate(-0.5deg)' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        your stats
      </motion.h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="retention" value={`${stats.retentionPct}%`} index={0} rotation={-1.5} />
        <StatCard label="streak" value={`${stats.streak}d`} index={1} rotation={0.8} />
        <StatCard label="mastered" value={stats.mastered} index={2} rotation={-0.5} />
        <StatCard label="total reviews" value={stats.totalReviews} index={3} rotation={1.2} />
      </div>

      {stats.subjects.length > 0 && (
        <motion.div
          className="card-hand p-6 relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="deco-tack" />
          <h2 className="text-lg font-hand text-pencil/50 uppercase tracking-wider mb-4 mt-2">
            <BarChart3 size={18} strokeWidth={2.5} className="inline" /> topics by subject
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.subjects}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13, fill: '#999', fontFamily: 'Patrick Hand' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 13, fill: '#999', fontFamily: 'Patrick Hand' }}
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
                formatter={(val) => [`${val} topics`, '']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.subjects.map((entry, index) => (
                  <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="mt-6 text-base font-body text-pencil/40">
        <p>retention = average confidence across all reviews, scaled to percentage</p>
        <p>mastered = topics with review interval greater than 30 days</p>
      </div>
    </div>
  );
}

const statIcons = {
  retention: Target,
  streak: Flame,
  mastered: Award,
  'total reviews': ListChecks,
};

function StatCard({ label, value, index, rotation = 0 }) {
  const Icon = statIcons[label] || Target;
  return (
    <motion.div
      className="stat-card card-hand px-5 py-4 relative"
      style={{ transform: `rotate(${rotation}deg)` }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={14} strokeWidth={2.5} className="text-pencil/40" />
        <p className="text-sm font-hand text-pencil/40 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-hand text-pencil mt-1 font-bold">{value}</p>
    </motion.div>
  );
}
