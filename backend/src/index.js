const express = require('express');
const cors = require('cors');
require('dotenv').config();

const tradesRouter = require('./routes/trades');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/trades', tradesRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Patrika API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Patrika API running on http://localhost:${PORT}`);
});
