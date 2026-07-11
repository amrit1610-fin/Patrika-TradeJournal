import { useState } from 'react';
import { createTrade } from '../api/trades';

export default function TradeForm({ selectedDate, onSuccess, onCancel }) {
  const getDefaultDateTime = () => {
    if (!selectedDate) return '';
    const now = new Date();
    const [y, m, d] = selectedDate.split('-');
    const pad = (n) => String(n).padStart(2, '0');
    return `${y}-${m}-${d}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const [form, setForm] = useState({
    dateTime: getDefaultDateTime(),
    duration: '',
    symbol: '',
    direction: 'Long',
    rr: '',
    reason: '',
    result: 'Win',
    grossPnl: '',
    fees: '0',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const netPnl = (parseFloat(form.grossPnl) || 0) - (parseFloat(form.fees) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'symbol' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createTrade({
        dateTime: new Date(form.dateTime).toISOString(),
        duration: parseInt(form.duration),
        symbol: form.symbol,
        direction: form.direction,
        rr: parseFloat(form.rr),
        reason: form.reason,
        result: form.result,
        grossPnl: parseFloat(form.grossPnl),
        fees: parseFloat(form.fees) || 0,
      });
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log trade');
    } finally {
      setLoading(false);
    }
  };

  const netPnlColor =
    netPnl > 0
      ? 'var(--color-profit)'
      : netPnl < 0
      ? 'var(--color-loss)'
      : 'var(--color-text-secondary)';

  const netPnlBgClass = netPnl > 0 ? 'profit-bg' : netPnl < 0 ? 'loss-bg' : 'neutral-bg';

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Two-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            Date &amp; Time
          </label>
          <input
            type="datetime-local"
            name="dateTime"
            value={form.dateTime}
            onChange={handleChange}
            required
            className="input-field"
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            Duration (min)
          </label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            min="1"
            placeholder="e.g. 45"
            required
            className="input-field"
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            Symbol
          </label>
          <input
            type="text"
            name="symbol"
            value={form.symbol}
            onChange={handleChange}
            placeholder="NIFTY"
            required
            className="input-field"
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            Direction
          </label>
          <select
            name="direction"
            value={form.direction}
            onChange={handleChange}
            className="input-field"
          >
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            Risk / Reward
          </label>
          <input
            type="number"
            name="rr"
            value={form.rr}
            onChange={handleChange}
            step="0.1"
            placeholder="1.5"
            required
            className="input-field"
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            Result
          </label>
          <select
            name="result"
            value={form.result}
            onChange={handleChange}
            className="input-field"
          >
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Breakeven">Breakeven</option>
          </select>
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            Gross PnL
          </label>
          <input
            type="number"
            name="grossPnl"
            value={form.grossPnl}
            onChange={handleChange}
            step="0.01"
            placeholder="0.00"
            required
            className="input-field"
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.25rem',
            }}
          >
            Fees
          </label>
          <input
            type="number"
            name="fees"
            value={form.fees}
            onChange={handleChange}
            step="0.01"
            placeholder="0.00"
            className="input-field"
          />
        </div>
      </div>

      {/* Reason textarea */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '0.25rem',
          }}
        >
          Reason / Trade Thesis
        </label>
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Describe your trade setup..."
          rows={3}
          required
          className="input-field"
          style={{ resize: 'none' }}
        />
      </div>

      {/* Net PnL Preview */}
      <div
        className={netPnlBgClass}
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Net PnL Preview
        </span>
        <span
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: netPnlColor,
          }}
        >
          {netPnl >= 0 ? '+' : ''}
          {netPnl.toFixed(2)}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: 'var(--color-loss)', fontSize: '0.875rem' }}>{error}</p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ flex: 1 }}
        >
          {loading ? 'Logging...' : 'Log Trade'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
