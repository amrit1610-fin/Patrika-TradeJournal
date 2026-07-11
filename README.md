# Patrika — Personal Trading Journal

A full-stack personal trading journal built with **React + Vite** (frontend) and **Node.js + Express + Prisma** (backend), using SQLite as the local database.

---

## Project Structure

```
trade_journal/
├── backend/          # Node.js/Express API (port 3001)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── dev.db          ← SQLite database (auto-created)
│   ├── src/
│   │   ├── index.js        ← Express server entry point
│   │   └── routes/
│   │       └── trades.js   ← CRUD API routes
│   ├── prisma.config.mjs
│   ├── .env
│   └── package.json
│
└── frontend/         # React + Vite UI (port 5173)
    ├── src/
    │   ├── api/trades.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── DayModal.jsx
    │   │   ├── TradeForm.jsx
    │   │   └── TradeTable.jsx
    │   └── pages/
    │       ├── Dashboard.jsx   ← Calendar home
    │       └── Analytics.jsx   ← Charts & insights
    └── package.json
```

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- npm 9+

---

## Setup & Run

### 1. Start the Backend

Open a terminal and run:

```powershell
cd c:\Users\kusha\Desktop\trade_journal\backend
npm run dev
```

The API will be available at **http://localhost:3001**

> Verify it's running: open http://localhost:3001/health — should return `{"status":"ok"}`

---

### 2. Start the Frontend

Open a **second terminal** and run:

```powershell
cd c:\Users\kusha\Desktop\trade_journal\frontend
npm run dev
```

The app will open at **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trades` | All trades (newest first) |
| GET | `/api/trades/month/:year/:month` | Trades for a calendar month |
| GET | `/api/trades/date/:date` | Trades for a specific date (YYYY-MM-DD) |
| POST | `/api/trades` | Create a new trade |
| PUT | `/api/trades/:id` | Update a trade |
| DELETE | `/api/trades/:id` | Delete a trade |

---

## Trade Schema

| Field | Type | Notes |
|-------|------|-------|
| `dateTime` | DateTime | Date + time of trade entry |
| `duration` | Int | Duration of trade in minutes |
| `symbol` | String | e.g. NIFTY, BANKNIFTY, AAPL |
| `direction` | String | "Long" or "Short" |
| `rr` | Float | Risk/Reward ratio |
| `reason` | String | Trade thesis / notes |
| `result` | String | "Win", "Loss", or "Breakeven" |
| `grossPnl` | Float | Gross profit/loss |
| `fees` | Float | Commissions/fees |
| `netPnl` | Float | Computed: grossPnl − fees |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS v4 |
| Charts | Recharts |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Backend | Node.js 18+, Express 5 |
| ORM | Prisma 7 (with better-sqlite3 adapter) |
| Database | SQLite (file: `backend/prisma/dev.db`) |

---

## Notes

- **No authentication** — this is a local personal app.
- The SQLite database (`dev.db`) is already created in `backend/prisma/`. No migration needed.
- If you ever need to reset the database: delete `backend/prisma/dev.db` and run `npx prisma db push` inside the `backend/` directory.
