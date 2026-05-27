import { useState } from 'react';
import { TOKENS } from '../data/appData';
import { Avatar, Button, Card, Tag } from '../components/ui';

const HERO_POINTS = [
  'Responsive layout built for desktop and mobile.',
  'Local login and signup with session persistence.',
  'One-page deploy on Render with static hosting.',
];

export default function LoginPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: 'Alex Kumar', email: 'alex@habitos.app', password: 'demo1234', confirm: 'demo1234' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    const result = mode === 'login'
      ? onLogin({ email: form.email, password: form.password })
      : onSignup({ name: form.name, email: form.email, password: form.password, confirm: form.confirm });

    if (!result.ok) {
      setError(result.error);
    }

    setBusy(false);
  };

  return (
    <div className="auth-shell">
      <section
        className="auth-panel glass"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 24,
          background:
            'radial-gradient(circle at top left, rgba(93, 125, 255, 0.20), transparent 28%), radial-gradient(circle at 78% 15%, rgba(242, 107, 138, 0.16), transparent 24%), rgba(16, 17, 26, 0.96)',
          borderRight: `1px solid ${TOKENS.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg, ${TOKENS.accent}, ${TOKENS.energy})`, display: 'grid', placeItems: 'center', fontSize: 20 }}>✦</div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700 }}>HabitOS</div>
            <div style={{ color: TOKENS.muted, fontSize: 13 }}>A focused system for habits, tasks, and momentum</div>
          </div>
        </div>

        <div style={{ maxWidth: 620 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <Tag color={TOKENS.success}>Desktop ready</Tag>
            <Tag color={TOKENS.accent}>Mobile ready</Tag>
            <Tag color={TOKENS.warn}>Render friendly</Tag>
          </div>

          <h1 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(38px, 7vw, 68px)', lineHeight: 0.96, letterSpacing: '-0.05em' }}>
            One workspace for discipline, focus, and daily wins.
          </h1>
          <p style={{ marginTop: 18, maxWidth: 560, color: TOKENS.muted, fontSize: 16, lineHeight: 1.7 }}>
            Sign in to track habits, run focus sessions, manage tasks, and keep your progress on one clean app that works well on laptops and phones.
          </p>

          <div style={{ display: 'grid', gap: 10, marginTop: 26 }}>
            {HERO_POINTS.map((point) => (
              <div key={point} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border}` }}>
                <span style={{ color: TOKENS.success, fontWeight: 800 }}>•</span>
                <span style={{ color: TOKENS.text, lineHeight: 1.55 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <Card style={{ padding: 18, maxWidth: 560 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 700 }}>Demo account</div>
              <div style={{ color: TOKENS.muted, fontSize: 13 }}>Use this to preview the app instantly</div>
            </div>
            <Avatar name="Alex Kumar" size={44} />
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            <div style={{ color: TOKENS.muted, fontSize: 13 }}>Email: alex@habitos.app</div>
            <div style={{ color: TOKENS.muted, fontSize: 13 }}>Password: demo1234</div>
          </div>
        </Card>
      </section>

      <section className="auth-form" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ width: '100%', maxWidth: 520, padding: 24, animation: 'floatIn 0.25s ease both' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <Button variant={mode === 'login' ? 'primary' : 'ghost'} onClick={() => setMode('login')} style={{ flex: 1 }}>Sign in</Button>
            <Button variant={mode === 'signup' ? 'primary' : 'ghost'} onClick={() => setMode('signup')} style={{ flex: 1 }}>Create account</Button>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</div>
            <div style={{ color: TOKENS.muted, fontSize: 13, marginTop: 6 }}>
              {mode === 'login'
                ? 'Continue with your HabitOS session.'
                : 'Set up a new local account in seconds.'}
            </div>
          </div>

          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            {mode === 'signup' ? (
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 12, color: TOKENS.muted }}>Full name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </label>
            ) : null}

            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontSize: 12, color: TOKENS.muted }}>Email</span>
              <input
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                type="email"
                placeholder="you@example.com"
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontSize: 12, color: TOKENS.muted }}>Password</span>
              <input
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                type="password"
                placeholder="Enter password"
                style={inputStyle}
              />
            </label>

            {mode === 'signup' ? (
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 12, color: TOKENS.muted }}>Confirm password</span>
                <input
                  value={form.confirm}
                  onChange={(event) => setForm((prev) => ({ ...prev, confirm: event.target.value }))}
                  type="password"
                  placeholder="Repeat password"
                  style={inputStyle}
                />
              </label>
            ) : null}

            {error ? (
              <div style={{ padding: '12px 14px', borderRadius: 12, background: `${TOKENS.energy}14`, border: `1px solid ${TOKENS.energy}30`, color: TOKENS.energy, fontSize: 13 }}>
                {error}
              </div>
            ) : null}

            <Button type="submit" size="lg" disabled={busy}>
              {busy ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm({ name: 'Alex Kumar', email: 'alex@habitos.app', password: 'demo1234', confirm: 'demo1234' });
                setMode('login');
                setError('');
              }}
            >
              Use demo credentials
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  borderRadius: 14,
  border: `1px solid ${TOKENS.border}`,
  background: TOKENS.card2,
  color: TOKENS.text,
  padding: '12px 14px',
  outline: 'none',
};