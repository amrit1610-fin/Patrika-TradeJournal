const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');
require('dotenv').config();

const router = express.Router();

// Prisma 7 requires a driver adapter — note: PrismaBetterSqlite3 (lowercase 's')
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
// Resolve to absolute path but keep the file: prefix — the adapter strips it internally
const dbAbsPath = dbUrl.startsWith('file:')
  ? 'file:' + path.resolve(__dirname, '..', '..', dbUrl.slice(5))
  : dbUrl;
const adapter = new PrismaBetterSqlite3({ url: dbAbsPath });
const prisma = new PrismaClient({ adapter });


// GET / — return all trades ordered by dateTime descending
router.get('/', async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: { dateTime: 'desc' },
    });
    res.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// GET /month/:year/:month — return trades within that calendar month
router.get('/month/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month parameter' });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const trades = await prisma.trade.findMany({
      where: {
        dateTime: { gte: start, lt: end },
      },
      orderBy: { dateTime: 'desc' },
    });

    res.json(trades);
  } catch (error) {
    console.error('Error fetching trades by month:', error);
    res.status(500).json({ error: 'Failed to fetch trades for the specified month' });
  }
});

// GET /date/:date — date param is YYYY-MM-DD, return all trades for that calendar date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;

    // Validate YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const day = new Date(date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const trades = await prisma.trade.findMany({
      where: {
        dateTime: { gte: day, lt: nextDay },
      },
      orderBy: { dateTime: 'asc' },
    });

    res.json(trades);
  } catch (error) {
    console.error('Error fetching trades by date:', error);
    res.status(500).json({ error: 'Failed to fetch trades for the specified date' });
  }
});

// POST / — create a new trade
router.post('/', async (req, res) => {
  try {
    const {
      dateTime,
      duration,
      symbol,
      direction,
      rr,
      reason,
      result,
      grossPnl,
      fees,
    } = req.body;

    // Basic validation
    if (!dateTime || !symbol || !direction || !result) {
      return res.status(400).json({ error: 'Missing required fields: dateTime, symbol, direction, result' });
    }

    const netPnl = grossPnl - fees;

    const trade = await prisma.trade.create({
      data: {
        dateTime: new Date(dateTime),
        duration: parseInt(duration, 10),
        symbol: String(symbol),
        direction: String(direction),
        rr: parseFloat(rr),
        reason: String(reason),
        result: String(result),
        grossPnl: parseFloat(grossPnl),
        fees: parseFloat(fees),
        netPnl: parseFloat(netPnl.toFixed(6)),
      },
    });

    res.status(201).json(trade);
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

// PUT /:id — update a trade by id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    const {
      dateTime,
      duration,
      symbol,
      direction,
      rr,
      reason,
      result,
      grossPnl,
      fees,
    } = req.body;

    // Build the update data object with only provided fields
    const updateData = {};

    if (dateTime !== undefined) updateData.dateTime = new Date(dateTime);
    if (duration !== undefined) updateData.duration = parseInt(duration, 10);
    if (symbol !== undefined) updateData.symbol = String(symbol);
    if (direction !== undefined) updateData.direction = String(direction);
    if (rr !== undefined) updateData.rr = parseFloat(rr);
    if (reason !== undefined) updateData.reason = String(reason);
    if (result !== undefined) updateData.result = String(result);
    if (grossPnl !== undefined) updateData.grossPnl = parseFloat(grossPnl);
    if (fees !== undefined) updateData.fees = parseFloat(fees);

    // Recompute netPnl if grossPnl or fees changed
    if (grossPnl !== undefined || fees !== undefined) {
      // Fetch existing record to get current values if only one changed
      const existing = await prisma.trade.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      const newGrossPnl = grossPnl !== undefined ? parseFloat(grossPnl) : existing.grossPnl;
      const newFees = fees !== undefined ? parseFloat(fees) : existing.fees;
      updateData.netPnl = parseFloat((newGrossPnl - newFees).toFixed(6));
    }

    const trade = await prisma.trade.update({
      where: { id },
      data: updateData,
    });

    res.json(trade);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Trade not found' });
    }
    console.error('Error updating trade:', error);
    res.status(500).json({ error: 'Failed to update trade' });
  }
});

// DELETE /:id — delete trade by id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    await prisma.trade.delete({
      where: { id },
    });

    res.json({ message: 'Trade deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Trade not found' });
    }
    console.error('Error deleting trade:', error);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

module.exports = router;
