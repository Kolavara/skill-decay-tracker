require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const topicRoutes = require('./routes/topics');
const statsRoutes = require('./routes/stats');
const { startCronJobs } = require('./services/cron');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/stats', statsRoutes);

// health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// error handler
app.use(errorHandler);

async function start() {
  await connectDB();
  startCronJobs();
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
}

start();
