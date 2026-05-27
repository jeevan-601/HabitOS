import { useState } from 'react';
import { TOKENS } from '../data/appData';
import { Avatar, Button, Card, SectionTitle, Tag } from '../components/ui';

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({ notifications: true, sounds: true, aiCoach: true, weeklyReport: true, darkMode: true, focusDuration: 25, breakDuration: 5 });

  const toggle = (key) => setPrefs((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Settings" subtitle="Tune HabitOS to your workflow." />

      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
          <Avatar name="Alex Kumar" size={56} />
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18 }}>Alex Kumar</div>
            <div style={{ color: TOKENS.muted, fontSize: 13 }}>alex@example.com</div>
            <div style={{ marginTop: 7 }}><Tag color={TOKENS.warn}>Legend · Level 8</Tag></div>
          </div>
        </div>
        <Button variant="outline" size="sm">Edit profile</Button>
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Notifications & Sound</div>
        <SettingRow label="Push Notifications" desc="Habit reminders and streak alerts" checked={prefs.notifications} onToggle={() => toggle('notifications')} />
        <SettingRow label="Sound Effects" desc="Timer end chimes and completions" checked={prefs.sounds} onToggle={() => toggle('sounds')} />
        <SettingRow label="Weekly Report" desc="Email summary every Sunday" checked={prefs.weeklyReport} onToggle={() => toggle('weeklyReport')} />
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>AI & Features</div>
        <SettingRow label="AI Focus Coach" desc="Personalized insights and recommendations" checked={prefs.aiCoach} onToggle={() => toggle('aiCoach')} />
        <SettingRow label="Dark Mode" desc="Always-on dark theme" checked={prefs.darkMode} onToggle={() => toggle('darkMode')} />
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Timer Settings</div>
        {[
          ['Focus Duration', 'focusDuration', 15, 60, 'min'],
          ['Short Break', 'breakDuration', 1, 15, 'min'],
        ].map(([label, key, min, max, unit]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
              <span>{label}</span>
              <span style={{ color: TOKENS.accent, fontWeight: 700 }}>{prefs[key]} {unit}</span>
            </div>
            <input type="range" min={min} max={max} value={prefs[key]} onChange={(event) => setPrefs((current) => ({ ...current, [key]: Number(event.target.value) }))} style={{ width: '100%', accentColor: TOKENS.accent }} />
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Account</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <Button variant="ghost">Export my data</Button>
          <Button variant="ghost">Privacy settings</Button>
          <Button variant="danger">Delete account</Button>
        </div>
      </Card>
    </div>
  );
}

function SettingRow({ label, desc, checked, onToggle }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid ${TOKENS.border}` }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 3 }}>{desc}</div>
      </div>
      <button onClick={onToggle} style={{ width: 46, height: 26, borderRadius: 999, border: 'none', background: checked ? TOKENS.accent : TOKENS.card2, position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    </div>
  );
}