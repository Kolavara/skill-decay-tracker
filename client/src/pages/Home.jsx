import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Check, Sparkles, TrendingUp, BarChart3, Minus, Clock, Zap, Target, Feather } from 'lucide-react';

const steps = [
  {
    num: '1',
    title: 'log what you study',
    desc: 'add topics from any subject — algorithms, systems design, math, whatever you\'re learning. give each one a confidence score from 1 to 5.',
    icon: BookOpen,
  },
  {
    num: '2',
    title: 'rate your confidence',
    desc: 'after each review, score yourself honestly. the SM-2 algorithm — the same one powering Anki — recalculates when you\'ll forget it.',
    icon: Brain,
  },
  {
    num: '3',
    title: 'forget less',
    desc: 'topics you struggle with come back sooner. things you know well get longer gaps. that\'s spaced repetition, and it works.',
    icon: Check,
  },
];

const features = [
  { title: 'SM-2 algorithm', desc: 'the same system used in Anki, adapted here to schedule your reviews based on how well you actually know something.', icon: Sparkles },
  { title: 'confidence tracking', desc: 'see your confidence change over time for every topic. charts don\'t lie.', icon: TrendingUp },
  { title: 'per-subject stats', desc: 'know which subjects you\'re strong in and which ones need work.', icon: BarChart3 },
  { title: 'no bloat', desc: 'just topics, reviews, and a schedule. no gamification, no streaks anxiety, no social features.', icon: Minus },
];

const techStack = [
  { name: 'React', desc: 'frontend' },
  { name: 'Node.js', desc: 'backend' },
  { name: 'MongoDB', desc: 'database' },
  { name: 'SM-2', desc: 'algorithm' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* hero */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        {/* decorative elements */}
        <div className="hidden md:block absolute top-16 right-12 w-16 h-16 border-2 border-dashed border-pencil/20 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="hidden md:block absolute bottom-12 right-20 w-8 h-8 border-2 border-blue/20 rotate-45" />

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-hand text-pencil leading-tight" style={{ transform: 'rotate(-1deg)' }}>
              skill decay<br />
              <span className="text-accent">tracker</span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl font-body text-pencil/70 mt-6 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            you studied it last week. do you still remember it? this app tracks what you're
            learning and tells you exactly when you'll forget it — so you can review before it's too late.
          </motion.p>

        </div>
      </section>

      <hr className="divider-hand max-w-4xl mx-auto" />

      {/* what is this? */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-hand text-pencil mb-6" style={{ transform: 'rotate(-0.5deg)' }}>
                what is skill decay?
              </h2>
              <p className="font-body text-pencil/70 text-lg leading-relaxed mb-4">
                it's a real phenomenon. you learn something on monday, and by friday it's gone.
                not because you're bad at learning — because your brain actively <em>forgets</em> things it doesn't use.
              </p>
              <p className="font-body text-pencil/70 text-lg leading-relaxed">
                the fix is <strong className="font-hand text-pencil">spaced repetition</strong> — reviewing material at
                increasing intervals, right before you'd forget it. this app automates that
                schedule using the <strong className="font-hand text-pencil">SM-2 algorithm</strong>,
                the same system behind Anki and other proven memory tools.
              </p>
            </motion.div>

            <motion.div
              className="card-hand p-6 relative"
              style={{ transform: 'rotate(1deg)' }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="deco-tack" />
              <h3 className="text-xl font-hand text-pencil mt-2 mb-4 flex items-center gap-2">
                <Zap size={20} strokeWidth={2.5} className="text-accent" /> the problem
              </h3>
              <div className="space-y-3 font-body text-pencil/70">
                <div className="flex items-start gap-3">
                  <Clock size={18} strokeWidth={2.5} className="text-accent mt-0.5 flex-shrink-0" />
                  <p>you studied algorithms last week. today you can't remember binary search.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Target size={18} strokeWidth={2.5} className="text-blue mt-0.5 flex-shrink-0" />
                  <p>you want to review, but you don't know <em>when</em> you'll forget each topic.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Feather size={18} strokeWidth={2.5} className="text-pencil/50 mt-0.5 flex-shrink-0" />
                  <p>without a system, you either over-study what you know or neglect what you don't.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <hr className="divider-hand max-w-4xl mx-auto" />

      {/* how it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-hand text-pencil mb-4" style={{ transform: 'rotate(0.5deg)' }}>
            how it works
          </h2>
          <p className="font-body text-pencil/50 text-lg mb-12">three steps. that's it.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative card-hand p-6"
                style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                <div className="absolute -top-4 -left-3 w-10 h-10 bg-postit border-2 border-pencil rounded-full flex items-center justify-center font-hand text-lg font-bold z-10">
                  {step.num}
                </div>
                <div className="mt-3 mb-2 flex items-center gap-2">
                  <step.icon size={20} strokeWidth={2.5} className="text-pencil/60" />
                  <h3 className="text-xl font-hand text-pencil">{step.title}</h3>
                </div>
                <p className="font-body text-pencil/70 text-lg">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider-hand max-w-4xl mx-auto" />

      {/* what you get */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-hand text-pencil mb-4" style={{ transform: 'rotate(-0.5deg)' }}>
            what you get
          </h2>
          <p className="font-body text-pencil/50 text-lg mb-12">everything you need, nothing you don't.</p>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className={`p-5 border-2 border-pencil cursor-pointer ${i === 0 ? 'postit' : 'bg-white'}`}
                style={{
                  borderRadius: i % 2 === 0
                    ? '2px 12px 2px 12px'
                    : '12px 2px 12px 2px',
                }}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20, rotate: i % 2 === 0 ? -0.5 : 0.8 }}
                whileInView={{ opacity: 1, x: 0, rotate: i % 2 === 0 ? -0.5 : 0.8 }}
                whileHover={{ scale: 1.03, rotate: i % 2 === 0 ? 1.5 : -1.5 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.15, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <f.icon size={18} strokeWidth={2.5} className="text-pencil/60" />
                  <h3 className="text-lg font-hand text-pencil">{f.title}</h3>
                </div>
                <p className="font-body text-pencil/70">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider-hand max-w-4xl mx-auto" />

      {/* built with */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-hand text-pencil mb-8 text-center" style={{ transform: 'rotate(0.3deg)' }}>
            built with
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((t, i) => (
              <motion.div
                key={t.name}
                className="px-5 py-3 border-2 border-pencil/30 font-hand text-lg cursor-pointer"
                style={{
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                }}
                initial={{ opacity: 0, scale: 0.9, rotate: i % 2 === 0 ? -1 : 1 }}
                whileInView={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -1 : 1 }}
                whileHover={{ scale: 1.08, rotate: i % 2 === 0 ? 3 : -3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.15, delay: i * 0.08 }}
              >
                <span className="text-pencil font-bold">{t.name}</span>
                <span className="text-pencil/40 ml-1">· {t.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="py-12 px-4 border-t-2 border-dashed border-pencil/20">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="font-hand text-pencil/50 text-lg">
            built with the SM-2 algorithm · no tracking · no ads · just your learning
          </p>
          <p className="font-body text-pencil/30 text-sm">
            a spaced repetition tool for students who want to remember what they study
          </p>
          <p className="font-hand text-pencil/50 text-sm mt-1" style={{ transform: 'rotate(-2deg)' }}>
            by Jd Rao
          </p>
        </div>
      </footer>
    </div>
  );
}
