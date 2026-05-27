import { DAYS, TOKENS } from '../data/appData';
import { Avatar, Button, Card, ProgressBar, SectionTitle, StatCard, Tag } from '../components/ui';

const dashboardTips = [
  { icon: '⏰', msg: 'Your peak focus is 9–11am. You are usually more productive in that window.', color: TOKENS.accent },
  { icon: '💧', msg: 'Hydration drops mid-week. Add a reminder after lunch?', color: TOKENS.warn },
  { icon: '🔥', msg: 'You are close to your longest streak ever. Keep the chain alive.', color: TOKENS.energy },
];

export default function DashboardPage({ habits, tasks, setPage }) {
  const doneTasks = tasks.filter((task) => task.done).length;
  const doneHabits = habits.filter((habit) => habit.done === true || (typeof habit.done === 'number' && habit.done >= habit.target)).length;
  const focusToday = 3.2;

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        title="Good morning, Alex"
        subtitle="Your habits, focus, and tasks are all in one place."
        action={(
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Tag color={TOKENS.warn}>🔥 14 streak</Tag>
            <Avatar name="Alex Kumar" size={40} />
          </div>
        )}
      />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Focus Today" value={`${focusToday}h`} color={TOKENS.accent} sub="+0.4h vs average" />
        <StatCard label="Habits Done" value={`${doneHabits}/${habits.length}`} color={TOKENS.success} sub="Daily completion" />
        <StatCard label="Tasks" value={`${doneTasks}/${tasks.length}`} color={TOKENS.warn} sub="Tasks finished" />
        <StatCard label="XP Today" value="+240" color={TOKENS.energy} sub="Level 8 · 81%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>Today&apos;s Habits</div>
            <Button variant="ghost" size="sm" onClick={() => setPage('habits')}>View all</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {habits.slice(0, 4).map((habit) => {
              const completed = habit.done === true || (typeof habit.done === 'number' && habit.done >= habit.target);
              const progress = habit.done === true ? habit.target : habit.done || 0;

              return (
                <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: `${habit.color}1f`, display: 'grid', placeItems: 'center', fontSize: 17 }}>{habit.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{habit.name}</div>
                    <ProgressBar value={progress} total={habit.target} color={habit.color} height={6} />
                  </div>
                  <div style={{ fontSize: 11, color: completed ? TOKENS.success : TOKENS.muted, fontWeight: 700 }}>{completed ? '✓' : `${progress}/${habit.target}`}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>Focus Session</div>
            <Button size="sm" onClick={() => setPage('focus')}>Start now</Button>
          </div>

          <div style={{ textAlign: 'center', padding: '8px 0 6px' }}>
            <div style={{ fontSize: 56, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: TOKENS.accent, letterSpacing: '-0.05em' }}>25:00</div>
            <div style={{ marginTop: 6, fontSize: 12, color: TOKENS.muted }}>Pomodoro · Deep Work</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {[1, 2, 3, 4].map((index) => (
                <div key={index} style={{ width: 8, height: 8, borderRadius: '50%', background: index <= 2 ? TOKENS.accent : TOKENS.card2 }} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>AI Insight</div>
          <Tag color={TOKENS.success}>AI Coach</Tag>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {dashboardTips.map((tip) => (
            <div key={tip.msg} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: `${tip.color}0f`, borderRadius: 14, border: `1px solid ${tip.color}22` }}>
              <span style={{ fontSize: 18 }}>{tip.icon}</span>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{tip.msg}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Weekly Focus</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 128 }}>
          {[2.5, 4.1, 1.8, 5.0, 3.2, 4.5, 3.2].map((value, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div style={{ fontSize: 10, color: TOKENS.muted }}>{value}h</div>
              <div style={{ width: '100%', height: `${(value / 5) * 84}px`, borderRadius: '10px 10px 4px 4px', background: index === 6 ? `linear-gradient(180deg, ${TOKENS.accent}, ${TOKENS.accentHover})` : `${TOKENS.accent}55` }} />
              <div style={{ fontSize: 10, color: TOKENS.muted }}>{DAYS[index]}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}