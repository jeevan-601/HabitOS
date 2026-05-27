import { NAV, TOKENS } from '../data/appData';
import { Avatar, Button } from './ui';

function NavButton({ item, active, onClick, collapsed = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 12,
        padding: collapsed ? '12px' : '12px 14px',
        borderRadius: 14,
        border: 'none',
        background: active ? `${TOKENS.accent}1c` : 'transparent',
        color: active ? TOKENS.accent : TOKENS.muted,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 20, textAlign: 'center', fontSize: 18 }}>{item.icon}</span>
      {!collapsed ? <span>{item.label}</span> : null}
    </button>
  );
}

export function AppShell({ user, activePage, setActivePage, collapsed, setCollapsed, onLogout, isMobile, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {!isMobile ? (
        <aside
          className="glass"
          style={{
            width: collapsed ? 84 : 250,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.22s ease',
            background: TOKENS.surface,
            borderRight: `1px solid ${TOKENS.border}`,
          }}
        >
          <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${TOKENS.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, ${TOKENS.accent}, ${TOKENS.energy})`, display: 'grid', placeItems: 'center', fontSize: 18 }}>✦</div>
            {!collapsed ? (
              <div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 17 }}>HabitOS</div>
                <div style={{ fontSize: 12, color: TOKENS.muted }}>Focus, habits, momentum</div>
              </div>
            ) : null}
          </div>

          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
            {NAV.map((item) => (
              <NavButton key={item.id} item={item} active={activePage === item.id} onClick={() => setActivePage(item.id)} collapsed={collapsed} />
            ))}
          </div>

          <div style={{ padding: 16, borderTop: `1px solid ${TOKENS.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={user.name} size={40} gradient={`${TOKENS.accent}, ${TOKENS.energy}`} />
              {!collapsed ? (
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: TOKENS.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>
              ) : null}
            </div>
            {!collapsed ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" size="sm" onClick={() => setCollapsed(true)} style={{ flex: 1 }}>Collapse</Button>
                <Button variant="outline" size="sm" onClick={onLogout} style={{ flex: 1 }}>Logout</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={onLogout}>↩</Button>
            )}
          </div>
        </aside>
      ) : null}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isMobile ? (
          <header
            className="glass"
            style={{
              background: TOKENS.surface,
              borderBottom: `1px solid ${TOKENS.border}`,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 10, background: `linear-gradient(135deg, ${TOKENS.accent}, ${TOKENS.energy})`, display: 'grid', placeItems: 'center', fontSize: 15 }}>✦</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>HabitOS</div>
            <div style={{ marginLeft: 'auto' }}>
              <Avatar name={user.name} size={30} />
            </div>
          </header>
        ) : null}

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px 16px 90px' : '30px 32px 36px' }}>
          {children}
          <div style={{ height: 8 }} />
        </main>

        {isMobile ? (
          <nav
            className="glass"
            style={{
              position: 'sticky',
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 2,
              padding: '6px 6px 10px',
              background: TOKENS.surface,
              borderTop: `1px solid ${TOKENS.border}`,
            }}
          >
            {NAV.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 2px',
                  border: 'none',
                  background: 'transparent',
                  color: activePage === item.id ? TOKENS.accent : TOKENS.muted,
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 600 }}>{item.label}</span>
              </button>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  );
}