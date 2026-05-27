import { useState } from 'react';
import { TOKENS, leaderboard } from '../data/appData';
import { Avatar, Card, ProgressBar, SectionTitle, Tag } from '../components/ui';

export default function SocialPage() {
  const [tab, setTab] = useState('global');

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Community" subtitle="Compete, compare, and stay motivated." />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['global', 'friends', 'challenges'].map((item) => (
          <button key={item} onClick={() => setTab(item)} style={tabButton(tab === item)}>{item}</button>
        ))}
      </div>

      {tab === 'global' ? (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={summaryCard}><div style={summaryValue}>{'#8'}</div><div style={summaryLabel}>Your Rank</div><div style={summarySub}>Top 2%</div></div>
            <div style={summaryCard}><div style={summaryValue}>#1</div><div style={summaryLabel}>Country Rank</div><div style={summarySub}>India 🇮🇳</div></div>
            <div style={summaryCard}><div style={summaryValue}>16h</div><div style={summaryLabel}>Focus Hours</div><div style={summarySub}>This week</div></div>
          </div>

          <Card>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Global Leaderboard</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.map((user, index) => (
                <div key={user.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 14, background: user.isYou ? `${TOKENS.accent}16` : TOKENS.card2, border: `1px solid ${user.isYou ? `${TOKENS.accent}55` : TOKENS.border}` }}>
                  <div style={{ width: 32, textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: index < 3 ? ['#f2b84b', '#c7c7d3', '#cd7f32'][index] : TOKENS.muted }}>{['🥇', '🥈', '🥉'][index] || `#${user.rank}`}</div>
                  <Avatar name={user.name} size={36} gradient={user.isYou ? `${TOKENS.accent}, ${TOKENS.energy}` : `${TOKENS.card2}, ${TOKENS.muted2}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>{user.name} {user.country} {user.isYou ? <Tag color={TOKENS.accent}>You</Tag> : null}</div>
                    <div style={{ fontSize: 11, color: TOKENS.muted, marginTop: 3 }}>{user.hours}h focus · {user.xp.toLocaleString()} XP</div>
                  </div>
                  <div style={{ width: 92 }}>
                    <ProgressBar value={user.hours} total={leaderboard[0].hours} color={user.isYou ? TOKENS.accent : TOKENS.muted2} height={5} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}

      {tab === 'friends' ? (
        <Card>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Friends Activity</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { name: 'Priya S.', action: 'Completed 7-day habit streak', time: '2 min ago', emoji: '🇮🇳' },
              { name: 'James T.', action: 'Finished a 3h deep work session', time: '1h ago', emoji: '🇺🇸' },
              { name: 'Lena M.', action: 'Added a new habit: Cold Shower', time: '3h ago', emoji: '🇩🇪' },
              { name: 'Carlos R.', action: 'Reached Level 12', time: '5h ago', emoji: '🇲🇽' },
            ].map((friend) => (
              <div key={friend.name} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: TOKENS.card2, borderRadius: 14 }}>
                <Avatar name={friend.name} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{friend.name} {friend.emoji}</div>
                  <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 4 }}>{friend.action}</div>
                  <div style={{ fontSize: 11, color: TOKENS.muted2, marginTop: 3 }}>{friend.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {tab === 'challenges' ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { name: '30-Day Focus Sprint', desc: 'Log 25+ min focus daily for 30 days', progress: 14, total: 30, color: TOKENS.accent, participants: '2.4k', ends: '16 days left' },
            { name: 'Global Habit Week', desc: 'Complete all habits for 7 consecutive days', progress: 5, total: 7, color: TOKENS.success, participants: '8.1k', ends: 'Ends in 3 days' },
            { name: 'Early Bird Month', desc: 'Log a habit before 7am, 20 days', progress: 12, total: 20, color: TOKENS.warn, participants: '1.8k', ends: '8 days left' },
          ].map((challenge) => (
            <Card key={challenge.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>{challenge.name}</div>
                  <div style={{ fontSize: 12, color: TOKENS.muted, marginTop: 3 }}>{challenge.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Tag color={challenge.color}>{challenge.ends}</Tag>
                  <Tag color={TOKENS.muted}>👥 {challenge.participants}</Tag>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.muted, marginBottom: 6 }}>
                <span>Progress</span>
                <span style={{ color: challenge.color }}>{challenge.progress}/{challenge.total}</span>
              </div>
              <ProgressBar value={challenge.progress} total={challenge.total} color={challenge.color} height={7} />
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const tabButton = (active) => ({
  padding: '8px 16px',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  textTransform: 'capitalize',
  background: active ? TOKENS.accent : TOKENS.card2,
  color: active ? '#fff' : TOKENS.muted,
  border: 'none',
});

const summaryCard = {
  flex: '1 1 150px',
  minWidth: 150,
  background: TOKENS.card,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 16,
  padding: 16,
};
const summaryValue = { fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 700, color: TOKENS.warn };
const summaryLabel = { marginTop: 2, fontSize: 12, color: TOKENS.text };
const summarySub = { marginTop: 4, fontSize: 11, color: TOKENS.muted };