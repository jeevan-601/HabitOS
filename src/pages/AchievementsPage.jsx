import { MONTHS, TOKENS, badges } from '../data/appData';
import { Card, ProgressBar, SectionTitle, StatCard, Tag } from '../components/ui';

export default function AchievementsPage() {
  const level = 8;
  const currentXp = 2450;
  const levelGoal = 3000;

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Achievements" subtitle="See your level, badges, and momentum." />

      <Card style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700 }}>Level {level} · Legend</div>
            <div style={{ fontSize: 13, color: TOKENS.muted, marginTop: 4 }}>{currentXp.toLocaleString()} XP · {levelGoal - currentXp} to Level {level + 1}</div>
          </div>
          <div style={{ fontSize: 34 }}>🌟</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.muted, marginBottom: 6 }}>
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
          <ProgressBar value={currentXp} total={levelGoal} color={TOKENS.warn} height={8} />
          <div style={{ fontSize: 11, color: TOKENS.muted, marginTop: 6 }}>{Math.round((currentXp / levelGoal) * 100)}% complete</div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Badges Earned" value={`${badges.filter((badge) => badge.earned).length}`} color={TOKENS.warn} />
        <StatCard label="Total XP" value="12.4k" color={TOKENS.accent} />
        <StatCard label="Challenges Won" value="8" color={TOKENS.success} />
      </div>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Badges</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {badges.map((badge) => (
            <div key={badge.name} style={{ padding: 16, borderRadius: 16, background: badge.earned ? `${badge.color}14` : TOKENS.card2, border: `1px solid ${badge.earned ? `${badge.color}44` : TOKENS.border}`, opacity: badge.earned ? 1 : 0.55, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10, filter: badge.earned ? 'none' : 'grayscale(1)' }}>{badge.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{badge.name}</div>
              <div style={{ fontSize: 11, color: TOKENS.muted }}>{badge.desc}</div>
              {badge.earned ? <div style={{ marginTop: 10 }}><Tag color={badge.color}>Earned ✓</Tag></div> : null}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>XP History - Last 7 Days</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 112 }}>
          {[180, 240, 120, 300, 210, 280, 190].map((value, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div style={{ width: '100%', height: `${(value / 300) * 82}px`, background: `${TOKENS.warn}66`, borderRadius: '10px 10px 4px 4px' }} />
              <div style={{ fontSize: 10, color: TOKENS.muted }}>{MONTHS[index % 12]}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}