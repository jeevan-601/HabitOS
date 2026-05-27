import { DAYS, MONTHS, TOKENS } from '../data/appData';
import { Card, ProgressBar, SectionTitle, StatCard, Tag } from '../components/ui';
import { calculateXp, countDoneHabits, countDoneTasks, formatFocusHours } from '../lib/accountMetrics';

export default function InsightsPage({ habits = [], tasks = [], user, profile }) {
  const weekData = [2.5, 4.1, 1.8, 5.0, 3.2, 4.5, 3.2];
  const habitData = [85, 92, 71, 100, 88, 95, 76];
  const maxWeek = Math.max(...weekData);
  const xp = calculateXp(habits, tasks);
  const doneHabits = countDoneHabits(habits);
  const doneTasks = countDoneTasks(tasks);
  const habitRate = habits.length ? Math.round((doneHabits / habits.length) * 100) : 0;
  const taskRate = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Analytics & Insights" subtitle="Spot patterns and keep improving." />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Focus Hours" value={formatFocusHours(profile?.focusMinutes ?? 0)} color={TOKENS.accent} sub="All-time pomodoro time" />
        <StatCard label="Habit Rate" value={`${habitRate}%`} color={TOKENS.success} sub={habits.length ? 'Based on current account' : 'No habits yet'} />
        <StatCard label="Task Rate" value={`${taskRate}%`} color={TOKENS.warn} sub={tasks.length ? 'Based on current account' : 'No tasks yet'} />
        <StatCard label="XP Earned" value={xp.total.toLocaleString()} color={TOKENS.energy} sub={`Level ${xp.level} · ${xp.progressToNextLevel} to next`} />
      </div>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Focus Hours by Day</div>
        <div style={{ fontSize: 12, color: TOKENS.muted, marginBottom: 16 }}>This week · quick view</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 128 }}>
          {weekData.map((value, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 10, color: TOKENS.muted }}>{value}h</div>
              <div style={{ width: '100%', height: `${(value / maxWeek) * 92}px`, background: index === 6 ? TOKENS.accent : `${TOKENS.accent}44`, borderRadius: '10px 10px 4px 4px' }} />
              <div style={{ fontSize: 10, color: TOKENS.muted }}>{DAYS[index]}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Habit Completion</div>
        <div style={{ fontSize: 12, color: TOKENS.muted, marginBottom: 16 }}>Average completion rate per day</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 112 }}>
          {habitData.map((value, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '100%', height: `${(value / 100) * 82}px`, background: value === 100 ? TOKENS.success : `${TOKENS.success}55`, borderRadius: '10px 10px 4px 4px' }} />
              <div style={{ fontSize: 10, color: TOKENS.muted }}>{DAYS[index]}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <Card>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Focus Distribution</div>
          {[
            ['Deep Work', 52, TOKENS.accent],
            ['Meetings', 22, TOKENS.energy],
            ['Learning', 18, TOKENS.success],
            ['Admin', 8, TOKENS.warn],
          ].map(([label, value, color]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                <span>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{value}%</span>
              </div>
              <ProgressBar value={value} total={100} color={color} height={6} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>Focus Hours</div>
            <Tag color={TOKENS.accent}>This week</Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 128 }}>
            {weekData.map((value, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 10, color: TOKENS.muted }}>{value}h</div>
                <div style={{ width: '100%', height: `${(value / maxWeek) * 92}px`, background: index === 6 ? TOKENS.accent : `${TOKENS.accent}44`, borderRadius: '10px 10px 4px 4px' }} />
                <div style={{ fontSize: 10, color: TOKENS.muted }}>{DAYS[index]}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Monthly Overview - {MONTHS[new Date().getMonth()]}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
          {DAYS.map((day) => <div key={day} style={{ textAlign: 'center', fontSize: 10, color: TOKENS.muted }}>{day}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {Array.from({ length: 30 }, (_, index) => {
            const score = index < 27 ? ((index * 17) % 100) / 100 : 0;
            const background = score > 0.8 ? TOKENS.accent : score > 0.5 ? `${TOKENS.accent}77` : score > 0.2 ? `${TOKENS.accent}33` : TOKENS.card2;
            return <div key={index} style={{ aspectRatio: '1', borderRadius: 8, background, display: 'grid', placeItems: 'center', fontSize: 9, color: score > 0.8 ? '#fff' : TOKENS.muted }}>{index + 1}</div>;
          })}
        </div>
      </Card>
    </div>
  );
}