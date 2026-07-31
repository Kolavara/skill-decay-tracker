import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'home', always: true },
  { to: '/dashboard', label: 'dashboard' },
  { to: '/topics', label: 'topics' },
  { to: '/stats', label: 'stats' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="border-b-2 border-dashed border-pencil/20 bg-paper/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to={user ? '/dashboard' : '/'} className="font-hand text-xl text-pencil tracking-tight inline-flex items-center gap-2">
            <Brain size={22} strokeWidth={2.5} />
            skill decay
          </Link>
          <div className="flex items-center gap-2">
            {links.filter(link => link.always || user).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-lg font-body px-3 py-1"
              >
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-postit border-2 border-pencil/30"
                    style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${
                  location.pathname === link.to
                    ? 'text-pencil font-bold'
                    : 'text-pencil/60 hover:text-pencil'
                }`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-body text-pencil/50 hidden sm:inline">{user.name}</span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={logout}
                className="text-sm font-body text-pencil/50 hover:text-accent transition-colors inline-flex items-center gap-1"
              >
                <LogOut size={14} strokeWidth={2.5} /> sign out
              </motion.button>
            </>
          ) : (
            <Link to="/login" className="btn-hand-secondary px-4 py-1.5 text-sm font-hand">
              log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
