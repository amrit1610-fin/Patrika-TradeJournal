import { deleteTrade } from '../api/trades';

export default function TradeTable({ trades, onDelete }) {
  const handleDelete = async (id) => {
    if (!confirm('Delete this trade?')) return;
    try {
      await deleteTrade(id);
      onDelete(id);
    } catch {
      alert('Failed to delete trade');
    }
  };

  if (!trades || trades.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 0',
          color: 'var(--color-text-secondary)',
        }}
      >
        <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</p>
        <p style={{ fontSize: '0.875rem' }}>No trades for this day yet.</p>
      </div>
    );
  }

  const HEADERS = [
    'Time', 'Symbol', 'Dir', 'Duration', 'R:R',
    'Result', 'Gross PnL', 'Fees', 'Net PnL', 'Reason', '',
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                  paddingBottom: '0.75rem',
                  paddingRight: '1rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const dirColor =
              trade.direction === 'Long'
                ? 'var(--color-profit)'
                : 'var(--color-loss)';
            const dirBg =
              trade.direction === 'Long'
                ? 'rgba(0, 255, 136, 0.1)'
                : 'rgba(255, 68, 68, 0.1)';
            const dirBorder =
              trade.direction === 'Long'
                ? 'rgba(0, 255, 136, 0.3)'
                : 'rgba(255, 68, 68, 0.3)';

            const resColor =
              trade.result === 'Win'
                ? 'var(--color-profit)'
                : trade.result === 'Loss'
                ? 'var(--color-loss)'
                : 'var(--color-text-secondary)';
            const resBg =
              trade.result === 'Win'
                ? 'rgba(0, 255, 136, 0.1)'
                : trade.result === 'Loss'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(136, 136, 170, 0.1)';
            const resBorder =
              trade.result === 'Win'
                ? 'rgba(0, 255, 136, 0.3)'
                : trade.result === 'Loss'
                ? 'rgba(255, 68, 68, 0.3)'
                : 'rgba(136, 136, 170, 0.3)';

            const grossColor =
              trade.grossPnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)';
            const netColor =
              trade.netPnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)';

            return (
              <tr
                key={trade.id}
                style={{ borderBottom: '1px solid rgba(42, 42, 62, 0.5)' }}
                className="trade-row"
              >
                <td
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0',
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {new Date(trade.dateTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {trade.symbol}
                </td>
                <td style={{ padding: '0.75rem 1rem 0.75rem 0' }}>
                  <span
                    style={{
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: dirColor,
                      backgroundColor: dirBg,
                      border: `1px solid ${dirBorder}`,
                    }}
                  >
                    {trade.direction}
                  </span>
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {trade.duration}m
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {trade.rr}x
                </td>
                <td style={{ padding: '0.75rem 1rem 0.75rem 0' }}>
                  <span
                    style={{
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: resColor,
                      backgroundColor: resBg,
                      border: `1px solid ${resBorder}`,
                    }}
                  >
                    {trade.result}
                  </span>
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0',
                    fontWeight: 500,
                    color: grossColor,
                  }}
                >
                  {trade.grossPnl >= 0 ? '+' : ''}
                  {trade.grossPnl.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {trade.fees.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0',
                    fontWeight: 700,
                    color: netColor,
                  }}
                >
                  {trade.netPnl >= 0 ? '+' : ''}
                  {trade.netPnl.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0',
                    color: 'var(--color-text-secondary)',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={trade.reason}
                >
                  {trade.reason}
                </td>
                <td style={{ padding: '0.75rem 0' }}>
                  <button
                    onClick={() => handleDelete(trade.id)}
                    style={{
                      color: 'var(--color-text-secondary)',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = 'var(--color-loss)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'var(--color-text-secondary)')
                    }
                    title="Delete trade"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
