import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--color-border-subtle)',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
      }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-accent)',
              boxShadow: '0 0 8px var(--color-accent)',
            }}
          />
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--color-text-primary)',
            }}
          >
            PATRIKA
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              marginLeft: '0.25rem',
              marginTop: '0.15rem',
            }}
          >
            Trading Journal
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
            })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/analytics"
            style={({ isActive }) => ({
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s',
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
            })}
          >
            Analytics
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
