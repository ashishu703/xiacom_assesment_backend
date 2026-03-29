require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const candidateRoutes = require('./routes/candidateRoutes');
const authRoutes = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const AppError = require('./utils/AppError');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);

app.use((_req, _res, next) => {
  next(new AppError('Route not found', 404));
});

app.use(errorMiddleware);

async function startServer() {
  if (!MONGO_URI) {
    // eslint-disable-next-line no-console
    console.error('Missing MONGO_URI in .env');
    process.exit(1);
  }

  if (!JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.error('Missing JWT_SECRET in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');

  await new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
      resolve();
    });
    server.on('error', reject);
  });
}

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
