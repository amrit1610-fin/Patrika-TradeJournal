import { useState, useEffect } from 'react';
import { getTradesByDate } from '../api/trades';
import TradeForm from './TradeForm';
import TradeTable from './TradeTable';

export default function DayModal({ date, onClose, onTradeAdded }) {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await getTradesByDate(date);
        setTrades(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [date]);

  const dailyNetPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);

  const handleTradeAdded = (newTrade) => {
    setTrades((prev) => [...prev, newTrade]);
    setShowForm(false);
    if (onTradeAdded) onTradeAdded();
  };

  const handleDelete = (id) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
    if (onTradeAdded) onTradeAdded();
  };

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pnlColor =
    dailyNetPnl > 0
      ? 'var(--color-profit)'
      : dailyNetPnl < 0
      ? 'var(--color-loss)'
      : 'var(--color-text-secondary)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          width: '100%',
          maxWidth: '48rem',
          backgroundColor: 'var(--color-bg-modal)',
          borderLeft: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {formattedDate}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              <span
                style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}
              >
                {trades.length} trade{trades.length !== 1 ? 's' : ''}
              </span>
              <span
                style={{ fontSize: '1.125rem', fontWeight: 700, color: pnlColor }}
              >
                {dailyNetPnl >= 0 ? '+' : ''}
                {dailyNetPnl.toFixed(2)} Net PnL
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--color-text-secondary)',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              transition: 'color 0.2s, background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-bg-card)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* Add Trade Section */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          {showForm ? (
            <div style={{ animation: 'slideUp 0.3s ease-out' }}>
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '1rem',
                  marginTop: 0,
                }}
              >
                New Trade Entry
              </h3>
              <TradeForm
                selectedDate={date}
                onSuccess={handleTradeAdded}
                onCancel={() => setShowForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              + Add Trade
            </button>
          )}
        </div>

        {/* Trade Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                padding: '2rem 0',
              }}
            >
              Loading trades...
            </div>
          ) : (
            <TradeTable trades={trades} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}
