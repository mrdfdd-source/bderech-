require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize DB (creates tables if not exist)
require('./db');

const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const chatRoutes = require('./routes/chat');

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BaDerech server running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'שגיאה בשרת, אנא נסה שוב' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ BaDerech server running on port ${PORT}`);
  console.log(`📁 Database: baderech.db`);
});

module.exports = app;
