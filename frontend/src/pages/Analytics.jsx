import { useState, useEffect, useMemo } from 'react';
import { getAllTrades } from '../api/trades';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PROFIT = '#00ff88';
const LOSS = '#ff4444';
const ACCENT = '#6366f1';
const NEUTRAL = '#8888aa';
const GRID = '#2a2a3e';
const TEXT = '#8888aa';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="card"
      style={{ padding: '0.75rem', fontSize: '0.875rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
    >
      {label && (
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem', margin: '0 0 0.25rem 0' }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p
          key={i}
          style={{
            color: p.color || p.fill || 'var(--color-text-primary)',
            fontWeight: 600,
            margin: '0.1rem 0',
          }}
        >
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <h2
    style={{
      fontSize: '1.125rem',
      fontWeight: 600,
      color: 'var(--color-text-primary)',
      marginBottom: '1rem',
      marginTop: 0,
    }}
  >
    {children}
  </h2>
);

const NoData = () => (
  <p
    style={{
      color: 'var(--color-text-secondary)',
      textAlign: 'center',
      padding: '3rem 0',
    }}
  >
    No data in selected range
  </p>
);

export default function Analytics() {
  const [allTrades, setAllTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(threeMonthsAgo);
  const [endDate, setEndDate] = useState(today);
  const [appliedStart, setAppliedStart] = useState(threeMonthsAgo);
  const [appliedEnd, setAppliedEnd] = useState(today);

  useEffect(() => {
    getAllTrades()
      .then((res) => {
        setAllTrades(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const trades = useMemo(() => {
    return allTrades.filter((t) => {
      const d = t.dateTime.split('T')[0];
      return d >= appliedStart && d <= appliedEnd;
    });
  }, [allTrades, appliedStart, appliedEnd]);

  // Equity curve
  const equityCurve = useMemo(() => {
    let running = 0;
    return [...trades]
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
      .map((t) => {
        running += t.netPnl;
        return {
          date: t.dateTime.split('T')[0],
          equity: parseFloat(running.toFixed(2)),
          netPnl: t.netPnl,
        };
      });
  }, [trades]);

  // Win/Loss pie data
  const winRateData = useMemo(() => {
    const counts = { Win: 0, Loss: 0, Breakeven: 0 };
    trades.forEach((t) => counts[t.result]++);
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [trades]);

  // PnL by symbol
  const pnlBySymbol = useMemo(() => {
    const map = {};
    trades.forEach((t) => {
      if (!map[t.symbol]) map[t.symbol] = 0;
      map[t.symbol] += t.netPnl;
    });
    return Object.entries(map)
      .map(([symbol, pnl]) => ({ symbol, pnl: parseFloat(pnl.toFixed(2)) }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  // PnL by direction
  const pnlByDirection = useMemo(() => {
    const map = { Long: 0, Short: 0 };
    trades.forEach((t) => (map[t.direction] = (map[t.direction] || 0) + t.netPnl));
    return Object.entries(map).map(([direction, pnl]) => ({
      direction,
      pnl: parseFloat(pnl.toFixed(2)),
    }));
  }, [trades]);

  // Duration vs PnL scatter
  const durationData = useMemo(
    () => trades.map((t) => ({ duration: t.duration, pnl: t.netPnl, symbol: t.symbol })),
    [trades]
  );

  const totalPnl = trades.reduce((s, t) => s + t.netPnl, 0);
  const wins = trades.filter((t) => t.result === 'Win').length;
  const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : 0;
  const avgRR =
    trades.length > 0
      ? (trades.reduce((s, t) => s + t.rr, 0) / trades.length).toFixed(2)
      : 0;
  const avgDuration =
    trades.length > 0
      ? Math.round(trades.reduce((s, t) => s + t.duration, 0) / trades.length)
      : 0;

  const PIE_COLORS = { Win: PROFIT, Loss: LOSS, Breakeven: NEUTRAL };

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          padding: '4rem 0',
        }}
      >
        Loading analytics...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Page Header */}
      <div>
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 0.25rem 0',
          }}
        >
          Analytics
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Performance insights from your trading history
        </p>
      </div>

      {/* Date Range Filter */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: '1rem',
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
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
            style={{ width: 'auto', colorScheme: 'dark' }}
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
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
            style={{ width: 'auto', colorScheme: 'dark' }}
          />
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setAppliedStart(startDate);
            setAppliedEnd(endDate);
          }}
        >
          Apply Filter
        </button>
        <button
          className="btn-ghost"
          onClick={() => {
            setStartDate(threeMonthsAgo);
            setEndDate(today);
            setAppliedStart(threeMonthsAgo);
            setAppliedEnd(today);
          }}
        >
          Reset
        </button>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            marginLeft: 'auto',
          }}
        >
          {trades.length} trades in range
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
        }}
      >
        {[
          {
            label: 'Net PnL',
            value: (totalPnl >= 0 ? '+' : '') + totalPnl.toFixed(2),
            color:
              totalPnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)',
          },
          {
            label: 'Win Rate',
            value: `${winRate}%`,
            color:
              parseFloat(winRate) >= 50
                ? 'var(--color-profit)'
                : 'var(--color-loss)',
          },
          {
            label: 'Avg R:R',
            value: `${avgRR}x`,
            color: 'var(--color-text-primary)',
          },
          {
            label: 'Total Trades',
            value: trades.length,
            color: 'var(--color-text-primary)',
          },
          {
            label: 'Avg Duration',
            value: `${avgDuration}m`,
            color: 'var(--color-text-primary)',
          },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '1rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                margin: '0 0 0.25rem 0',
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: s.color,
                margin: 0,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <SectionTitle>Cumulative Equity Curve</SectionTitle>
        {equityCurve.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis
                dataKey="date"
                tick={{ fill: TEXT, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
              />
              <YAxis
                tick={{ fill: TEXT, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={ACCENT}
                fill="url(#equityGrad)"
                strokeWidth={2}
                dot={false}
                name="Cumulative PnL"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </div>

      {/* Pie + Direction Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.5rem' }}>
          <SectionTitle>Win / Loss / Breakeven</SectionTitle>
          {winRateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={winRateData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {winRateData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <SectionTitle>PnL by Direction</SectionTitle>
          {pnlByDirection.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pnlByDirection}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis
                  dataKey="direction"
                  tick={{ fill: TEXT, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: GRID }}
                />
                <YAxis
                  tick={{ fill: TEXT, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" name="Net PnL" radius={[6, 6, 0, 0]}>
                  {pnlByDirection.map((entry) => (
                    <Cell
                      key={entry.direction}
                      fill={entry.pnl >= 0 ? PROFIT : LOSS}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </div>
      </div>

      {/* PnL by Symbol */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <SectionTitle>PnL by Symbol</SectionTitle>
        {pnlBySymbol.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={Math.max(200, pnlBySymbol.length * 50)}
          >
            <BarChart data={pnlBySymbol} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: TEXT, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
              />
              <YAxis
                type="category"
                dataKey="symbol"
                tick={{ fill: TEXT, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" name="Net PnL" radius={[0, 6, 6, 0]}>
                {pnlBySymbol.map((entry) => (
                  <Cell
                    key={entry.symbol}
                    fill={entry.pnl >= 0 ? PROFIT : LOSS}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </div>

      {/* Duration vs PnL Scatter */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <SectionTitle>Trade Duration vs Net PnL</SectionTitle>
        {durationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis
                dataKey="duration"
                name="Duration (min)"
                tick={{ fill: TEXT, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                label={{
                  value: 'Duration (min)',
                  position: 'insideBottom',
                  offset: -5,
                  fill: TEXT,
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="pnl"
                name="Net PnL"
                tick={{ fill: TEXT, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: GRID }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div
                      className="card"
                      style={{ padding: '0.75rem', fontSize: '0.875rem' }}
                    >
                      <p
                        style={{
                          color: 'var(--color-text-secondary)',
                          margin: '0 0 0.15rem 0',
                        }}
                      >
                        {d?.symbol}
                      </p>
                      <p
                        style={{
                          color: 'var(--color-text-primary)',
                          margin: '0 0 0.15rem 0',
                        }}
                      >
                        Duration: {d?.duration}m
                      </p>
                      <p
                        style={{
                          color: d?.pnl >= 0 ? PROFIT : LOSS,
                          margin: 0,
                          fontWeight: 600,
                        }}
                      >
                        PnL: {d?.pnl?.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <Scatter data={durationData} name="Trades">
                {durationData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.pnl >= 0 ? PROFIT : LOSS}
                    fillOpacity={0.8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </div>
    </div>
  );
}
