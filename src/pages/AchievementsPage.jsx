import { MONTHS, TOKENS, badges } from '../data/appData';
import { Card, ProgressBar, SectionTitle, StatCard, Tag } from '../components/ui';
import { calculateXp } from '../lib/accountMetrics';

// FIX: accept real habits/tasks/profile instead of hardcoded values
export default function AchievementsPage({ habits = [], tasks = [], profile }) {
  const xp = calculateXp(habits, tasks);
  const XP_PER_LEVEL = 500;
  // Earned badges: only the ones that are actually unlocked based on real data
  const earnedBadges = resolveBadges(habits, tasks, profile);

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Achievements" subtitle="See your level, badges, and momentum." />

      <Card style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700 }}>
              Level {xp.level} · {getLevelTitle(xp.level)}
            </div>
            <div style={{ fontSize: 13, color: TOKENS.muted, marginTop: 4 }}>
              {xp.total.toLocaleString()} XP · {xp.progressToNextLevel} to Level {xp.level + 1}
            </div>
          </div>
          <div style={{ fontSize: 34 }}>{getLevelEmoji(xp.level)}</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.muted, marginBottom: 6 }}>
            <span>Level {xp.level}</span>
            <span>Level {xp.level + 1}</span>
          </div>
          <ProgressBar value={xp.progressInLevel} total={XP_PER_LEVEL} color={TOKENS.warn} height={8} />
          <div style={{ fontSize: 11, color: TOKENS.muted, marginTop: 6 }}>
            {Math.round(xp.percentToNextLevel)}% complete
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Badges Earned" value={`${earnedBadges}`} color={TOKENS.warn} />
        <StatCard label="Total XP" value={xp.total >= 1000 ? `${(xp.total / 1000).toFixed(1)}k` : String(xp.total)} color={TOKENS.accent} />
        <StatCard label="Focus Min" value={`${profile?.focusMinutes ?? 0}`} color={TOKENS.success} />
      </div>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Badges</div>
        {badges.length === 0 ? (
          <div style={{ color: TOKENS.muted, fontSize: 13 }}>Complete habits and tasks to unlock badges.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {badges.map((badge) => {
              const unlocked = isBadgeUnlocked(badge, habits, tasks, profile);
              return (
                <div
                  key={badge.name}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: unlocked ? `${badge.color}14` : TOKENS.card2,
                    border: `1px solid ${unlocked ? `${badge.color}44` : TOKENS.border}`,
                    opacity: unlocked ? 1 : 0.55,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10, filter: unlocked ? 'none' : 'grayscale(1)' }}>{badge.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{badge.name}</div>
                  <div style={{ fontSize: 11, color: TOKENS.muted }}>{badge.desc}</div>
                  {unlocked ? <div style={{ marginTop: 10 }}><Tag color={badge.color}>Earned ✓</Tag></div> : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>XP Breakdown</div>
        {xp.total === 0 ? (
          <div style={{ color: TOKENS.muted, fontSize: 13 }}>Complete habits and tasks to earn XP.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 112 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((_, index) => {
              const value = index === 6 ? xp.total : 0;
              const height = xp.total > 0 ? Math.max(8, (value / Math.max(xp.total, 1)) * 82) : 8;
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: '100%', height: `${height}px`, background: `${TOKENS.warn}66`, borderRadius: '10px 10px 4px 4px' }} />
                  <div style={{ fontSize: 10, color: TOKENS.muted }}>{MONTHS[index % 12]}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// Determine which badges are actually earned based on real data
function isBadgeUnlocked(badge, habits, tasks, profile) {
  const completedHabits = habits.filter((h) => h.done === true || (typeof h.done === 'number' && h.done >= h.target));
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak ?? 0), 0);
  const focusMinutes = profile?.focusMinutes ?? 0;

  switch (badge.name) {
    case '14-Day Streak': return maxStreak >= 14;
    case '100 Sessions': return focusMinutes >= 100 * 25; // 100 focus sessions of 25 min
    case 'Night Owl': return focusMinutes >= 60; // simplified
    case 'Hydration Hero': return completedHabits.some((h) => h.name?.toLowerCase().includes('water') && (h.streak ?? 0) >= 30);
    case 'Bookworm': return completedHabits.filter((h) => h.category === 'Learning').length >= 20;
    case 'Top 1%': return false; // server-side only
    case 'Speed Runner': return focusMinutes >= 600;
    case 'Global Legend': return false; // server-side only
    default: return badge.earned === true;
  }
}

function resolveBadges(habits, tasks, profile) {
  return badges.filter((b) => isBadgeUnlocked(b, habits, tasks, profile)).length;
}

function getLevelTitle(level) {
  if (level >= 20) return 'Legend';
  if (level >= 10) return 'Expert';
  if (level >= 5) return 'Adept';
  if (level >= 2) return 'Apprentice';
  return 'Beginner';
}

function getLevelEmoji(level) {
  if (level >= 20) return '🌟';
  if (level >= 10) return '⚡';
  if (level >= 5) return '🔥';
  if (level >= 2) return '✨';
  return '🌱';
}
