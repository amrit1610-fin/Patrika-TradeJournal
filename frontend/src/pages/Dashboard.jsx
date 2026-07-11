import { useState, useEffect, useCallback } from 'react';
import { getTradesByMonth } from '../api/trades';
import DayModal from '../components/DayModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Dashboard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTradesByMonth(year, month);
      setTrades(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Aggregate by date
  const dailyData = {};
  trades.forEach((trade) => {
    const dateKey = trade.dateTime.split('T')[0];
    if (!dailyData[dateKey]) dailyData[dateKey] = { netPnl: 0, count: 0 };
    dailyData[dateKey].netPnl += trade.netPnl;
    dailyData[dateKey].count += 1;
  });

  const monthlyPnl = trades.reduce((s, t) => s + t.netPnl, 0);
  const wins = trades.filter((t) => t.result === 'Win').length;
  const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : 0;

  // Calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  const monthlyPnlColor =
    monthlyPnl > 0
      ? 'var(--color-profit)'
      : monthlyPnl < 0
      ? 'var(--color-loss)'
      : 'var(--color-text-primary)';
  const winRateColor =
    parseFloat(winRate) >= 50 ? 'var(--color-profit)' : 'var(--color-loss)';

  return (
    <div
      style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Summary Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
              margin: '0 0 0.25rem 0',
            }}
          >
            Monthly Net PnL
          </p>
          <p style={{ fontSize: '1.875rem', fontWeight: 700, color: monthlyPnlColor, margin: 0 }}>
            {monthlyPnl >= 0 ? '+' : ''}
            {monthlyPnl.toFixed(2)}
          </p>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              margin: '0 0 0.25rem 0',
            }}
          >
            Total Trades
          </p>
          <p
            style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {trades.length}
          </p>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              margin: '0 0 0.25rem 0',
            }}
          >
            Win Rate
          </p>
          <p
            style={{ fontSize: '1.875rem', fontWeight: 700, color: winRateColor, margin: 0 }}
          >
            {winRate}%
          </p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Calendar Nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <button
            onClick={prevMonth}
            className="btn-ghost"
            style={{ fontSize: '1.25rem', padding: '0.5rem 0.75rem' }}
          >
            ←
          </button>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {MONTHS[month - 1]} {year}
          </h1>
          <button
            onClick={nextMonth}
            className="btn-ghost"
            style={{ fontSize: '1.25rem', padding: '0.5rem 0.75rem' }}
          >
            →
          </button>
        </div>

        {/* Day Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          {DAYS.map((d) => (
            <div
              key={d}
              style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                padding: '0.75rem 0',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              padding: '4rem 0',
            }}
          >
            Loading calendar...
          </div>
        ) : (
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}
          >
            {cells.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      borderBottom: '1px solid rgba(42, 42, 62, 0.3)',
                      borderRight: '1px solid rgba(42, 42, 62, 0.3)',
                      height: '6rem',
                    }}
                  />
                );
              }

              const dateKey = `${year}-${pad(month)}-${pad(day)}`;
              const data = dailyData[dateKey];
              const isToday =
                year === today.getFullYear() &&
                month === today.getMonth() + 1 &&
                day === today.getDate();
              const pnl = data?.netPnl ?? null;

              const pnlColor =
                pnl > 0
                  ? 'var(--color-profit)'
                  : pnl < 0
                  ? 'var(--color-loss)'
                  : 'var(--color-text-secondary)';

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  style={{
                    height: '6rem',
                    padding: '0.5rem',
                    borderBottom: '1px solid rgba(42, 42, 62, 0.3)',
                    borderRight: '1px solid rgba(42, 42, 62, 0.3)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: 'none',
                    border: isToday
                      ? '1px solid var(--color-accent)'
                      : '1px solid rgba(42, 42, 62, 0.3)',
                    position: 'relative',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      pnl > 0
                        ? 'rgba(0, 255, 136, 0.05)'
                        : pnl < 0
                        ? 'rgba(255, 68, 68, 0.05)'
                        : 'rgba(18, 18, 26, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: isToday
                        ? 'var(--color-accent)'
                        : 'var(--color-text-secondary)',
                      display: 'block',
                    }}
                  >
                    {day}
                  </span>
                  {data && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: pnlColor,
                          display: 'inline-block',
                        }}
                      >
                        {pnl >= 0 ? '+' : ''}
                        {pnl.toFixed(0)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.625rem',
                          color: 'var(--color-text-secondary)',
                          display: 'block',
                          marginTop: '0.1rem',
                        }}
                      >
                        {data.count} trade{data.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Day Modal */}
      {selectedDate && (
        <DayModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onTradeAdded={fetchTrades}
        />
      )}
    </div>
  );
}
