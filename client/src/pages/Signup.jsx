import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-5xl font-hand text-pencil mb-1" style={{ transform: 'rotate(0.5deg)' }}>
          start fresh
        </h1>
        <p className="text-xl font-body text-pencil/60 mb-8">track what you're learning</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-hand text-pencil mb-1 inline-flex items-center gap-1.5"><User size={16} strokeWidth={2.5} /> name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full input-hand text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-hand text-pencil mb-1 inline-flex items-center gap-1.5"><Mail size={16} strokeWidth={2.5} /> email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full input-hand text-lg"
            />
          </div>
          <div>
            <label className="block text-lg font-hand text-pencil mb-1 inline-flex items-center gap-1.5"><Lock size={16} strokeWidth={2.5} /> password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full input-hand text-lg"
            />
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="postit px-3 py-2 font-body text-accent text-sm"
            >
              {error}
            </motion.div>
          )}
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-hand py-3 text-xl font-hand"
          >
            {submitting ? 'creating account...' : <><UserPlus size={18} strokeWidth={2.5} /> sign up</>}
          </motion.button>
        </form>

        <motion.p
          className="text-lg font-body text-pencil/50 mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          already have an account?{' '}
          <Link to="/login" className="text-blue hover:underline font-hand">log in</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
