import { TOKENS } from '../data/appData';

export function Card({ children, style, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: TOKENS.card,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: 18,
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Tag({ children, color = TOKENS.accent, style }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
        padding: '4px 10px',
        borderRadius: 999,
        background: `${color}18`,
        color,
        border: `1px solid ${color}30`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Button({ children, onClick, type = 'button', variant = 'primary', size = 'md', style, disabled }) {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${TOKENS.accent}, ${TOKENS.accentHover})`,
      color: '#fff',
      border: 'none',
      boxShadow: `0 14px 30px ${TOKENS.accent}33`,
    },
    outline: {
      background: 'transparent',
      color: TOKENS.accent,
      border: `1px solid ${TOKENS.accent}`,
    },
    ghost: {
      background: TOKENS.card2,
      color: TOKENS.text,
      border: `1px solid ${TOKENS.border}`,
    },
    danger: {
      background: `${TOKENS.energy}16`,
      color: TOKENS.energy,
      border: `1px solid ${TOKENS.energy}33`,
    },
  };

  const sizes = {
    sm: { padding: '8px 12px', fontSize: 12 },
    md: { padding: '11px 16px', fontSize: 13 },
    lg: { padding: '14px 20px', fontSize: 14 },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 0.18s ease, opacity 0.18s ease, border-color 0.18s ease',
        opacity: disabled ? 0.6 : 1,
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, total, color = TOKENS.accent, height = 7 }) {
  const percent = total > 0 ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;

  return (
    <div style={{ height, background: TOKENS.card2, borderRadius: height, overflow: 'hidden', border: `1px solid ${TOKENS.border}` }}>
      <div
        style={{
          width: `${percent}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: height,
          transition: 'width 0.45s ease',
        }}
      />
    </div>
  );
}

export function Avatar({ name, size = 36, gradient = `${TOKENS.accent}, ${TOKENS.energy}` }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${gradient})`,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: Math.max(12, size * 0.36),
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function StatCard({ label, value, color = TOKENS.accent, sub }) {
  return (
    <div
      style={{
        flex: '1 1 150px',
        minWidth: 140,
        background: TOKENS.card2,
        borderRadius: 16,
        padding: '16px 18px',
        border: `1px solid ${TOKENS.border}`,
      }}
    >
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ marginTop: 2, fontSize: 12, color: TOKENS.muted }}>{label}</div>
      {sub ? <div style={{ marginTop: 4, fontSize: 11, color: TOKENS.muted2 }}>{sub}</div> : null}
    </div>
  );
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em' }}>{title}</div>
        {subtitle ? <div style={{ marginTop: 4, fontSize: 13, color: TOKENS.muted }}>{subtitle}</div> : null}
      </div>
      {action}
    </div>
  );
}