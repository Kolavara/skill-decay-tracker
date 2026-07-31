import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import TopicDetail from './pages/TopicDetail';
import Stats from './pages/Stats';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen font-hand text-pencil text-xl">loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;
  return children;
}

function PageWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const lenisRef = useRef();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced && lenisRef.current?.lenis) {
      lenisRef.current.lenis.smooth = false;
    }
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper font-hand text-pencil">
        <p className="text-xl">loading...</p>
      </div>
    );
  }

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ lerp: 0.1, duration: 1.2, syncTouch: true, autoRaf: false }}
    >
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/login" element={<GuestRoute><PageWrapper><Login /></PageWrapper></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><PageWrapper><Signup /></PageWrapper></GuestRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
              <Route path="/topics" element={<ProtectedRoute><PageWrapper><Topics /></PageWrapper></ProtectedRoute>} />
              <Route path="/topics/:id" element={<ProtectedRoute><PageWrapper><TopicDetail /></PageWrapper></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><PageWrapper><Stats /></PageWrapper></ProtectedRoute>} />
              <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </ReactLenis>
  );
}
