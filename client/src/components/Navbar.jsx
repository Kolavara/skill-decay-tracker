import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, LogOut, Bell, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const links = [
  { to: '/', label: 'home', always: true },
  { to: '/dashboard', label: 'dashboard' },
  { to: '/topics', label: 'topics' },
  { to: '/stats', label: 'stats' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [dueTopics, setDueTopics] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch due topics when logged in
  useEffect(() => {
    if (user) {
      api.get('/topics/due')
        .then(res => {
          const topics = res.data.topics || [];
          setDueTopics(topics);

          // Handle Desktop Notifications
          if (topics.length > 0 && 'Notification' in window) {
            const todayStr = new Date().toLocaleDateString();
            const lastNotified = localStorage.getItem('lastNotifiedDate');

            if (lastNotified !== todayStr) {
              if (Notification.permission === 'granted') {
                new Notification('Skill Decay Tracker', {
                  body: `You have ${topics.length} topic(s) due for review today!`,
                  icon: '/favicon.ico' // optional, will fallback gracefully if missing
                });
                localStorage.setItem('lastNotifiedDate', todayStr);
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Skill Decay Tracker', {
                      body: `You have ${topics.length} topic(s) due for review today!`,
                    });
                    localStorage.setItem('lastNotifiedDate', todayStr);
                  }
                });
              }
            }
          }
        })
        .catch(console.error);
    } else {
      setDueTopics([]);
    }
  }, [user, location.pathname]);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="border-b-2 border-dashed border-pencil/20 bg-paper/90 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-3 md:gap-8">
          <Link to={user ? '/dashboard' : '/'} className="font-hand text-xl text-pencil tracking-tight inline-flex items-center gap-2">
            <Brain size={22} strokeWidth={2.5} className="flex-shrink-0" />
            <span className="hidden sm:inline">skill decay</span>
          </Link>
          <div className="flex items-center gap-0.5 md:gap-2">
            {links.filter(link => link.always || user).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-base md:text-lg font-body px-2 md:px-3 py-1"
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

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          {user ? (
            <>
              {/* Notification Bell with Badge */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-pencil/70 hover:text-pencil transition-colors rounded-full focus:outline-none"
                title="Review Notifications"
              >
                <Bell size={22} strokeWidth={2.5} />
                {dueTopics.length > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-body font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white shadow-sm">
                    {dueTopics.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95, rotate: 2 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 2 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute right-0 top-full mt-4 w-[85vw] sm:w-80 bg-[#fff9c4] border-2 border-pencil z-50 font-hand p-4"
                    style={{ 
                      borderRadius: '2px 12px 2px 12px',
                      boxShadow: '4px 4px 0px 0px rgba(45, 45, 45, 0.2)',
                      marginRight: '-10px'
                    }}
                  >
                    <div className="deco-tape" style={{ top: '-10px', transform: 'translateX(-50%) rotate(-3deg)', width: '80px' }} />
                    <div className="flex items-center justify-between pb-2 border-b-2 border-pencil mb-3 mt-1">
                      <span className="font-bold text-pencil text-base sm:text-lg flex items-center gap-1.5">
                        <Clock size={16} strokeWidth={2.5} className="text-accent" /> study reminders
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-pencil/60">
                        {dueTopics.length} due
                      </span>
                    </div>

                    {dueTopics.length > 0 ? (
                      <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                        {dueTopics.slice(0, 5).map((t) => (
                          <div key={t._id} className="py-2 border-b-2 border-dashed border-pencil/20 last:border-0 flex items-center justify-between group">
                            <div className="overflow-hidden">
                              <p className="font-bold text-pencil text-sm sm:text-base leading-tight group-hover:text-accent transition-colors truncate pr-2">{t.name}</p>
                              <span className="text-xs sm:text-sm text-pencil/50 truncate block">{t.subject}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs bg-white text-accent font-bold px-2 py-0.5 rounded-full border-2 border-accent flex-shrink-0">
                              due
                            </span>
                          </div>
                        ))}
                        {dueTopics.length > 5 && (
                          <p className="text-sm text-pencil/50 text-center pt-2 font-bold">
                            + {dueTopics.length - 5} more topics
                          </p>
                        )}
                        <Link
                          to="/dashboard"
                          onClick={() => setShowNotifications(false)}
                          className="btn-hand block text-center w-full py-2 mt-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2 bg-white"
                        >
                          review now <ArrowRight size={16} strokeWidth={2.5} />
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-pencil/60">
                        <p className="text-base sm:text-lg font-bold">🎉 all caught up!</p>
                        <p className="text-xs sm:text-sm text-pencil/50 mt-1 font-body">no topics due for review right now.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <span className="text-sm font-body text-pencil/50 hidden md:inline">{user.name}</span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={logout}
                className="text-sm font-body text-pencil/50 hover:text-accent transition-colors inline-flex items-center gap-1"
                title="Sign Out"
              >
                <LogOut size={16} strokeWidth={2.5} className="md:mr-1" />
                <span className="hidden md:inline">sign out</span>
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
