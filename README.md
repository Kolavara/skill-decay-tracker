# Skill Decay Tracker

A spaced-repetition web app I built for tracking topics I've studied and figuring out when I'm likely to forget them. The idea is simple: you rate how well you remember something after studying it, and the app calculates when you should review it again based on the SM-2 algorithm.

## How it works

When you log a topic with a confidence rating (1-5), the app runs it through a modified version of the SM-2 spaced repetition algorithm. Topics you're shaky on come back sooner, topics you know well get pushed further out. The dashboard shows everything that's due today, and you can quick-rate topics right from the list without opening the full detail page.

## Tech stack

- **Frontend:** React 18 with Vite, Tailwind CSS, Recharts for the confidence-over-time chart
- **Backend:** Express.js with JWT auth (httpOnly cookies), bcrypt, express-validator
- **Database:** MongoDB with Mongoose
- **Other:** node-cron for daily digest jobs, Nodemailer for optional email reminders

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a connection string for Atlas)

### Backend

```bash
cd server
cp .env.example .env    # fill in your MongoDB URI and a JWT secret
npm install
npm run seed              # creates a demo user with ~15 sample topics
npm run dev               # starts on port 5000
```

### Frontend

```bash
cd client
npm install
npm run dev               # starts on port 5173, proxies /api to backend
```

### Demo login

```
email: alex@example.com
password: demo123
```

The seed script creates topics across Data Structures, Algorithms, and System Design with varied review histories so the app looks populated right away.

## Project structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Navbar
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Dashboard, Topics, TopicDetail, Stats, Login, Signup
│   │   ├── api.js          # Axios instance
│   │   └── App.jsx         # Routes and layout
│   └── tailwind.config.js
└── server/
    ├── config/             # MongoDB connection
    ├── middleware/          # Auth, error handler
    ├── models/             # User, Topic, ReviewSession
    ├── routes/             # auth, topics, stats
    ├── scripts/            # seed.js
    ├── services/           # SM-2 algorithm, cron jobs, email
    └── server.js           # Entry point
```

## What I learned

- The SM-2 algorithm is deceptively simple but tricky to get right in edge cases, especially the ease factor floor (1.3) and the reset behavior for low-confidence reviews
- Using httpOnly cookies for JWT instead of localStorage is straightforward with Express and cookie-parser, but you have to remember `credentials: include` on the fetch side
- MongoDB indexes on compound keys (userId + nextReviewDate) make the "due today" query fast even with lots of topics
