import { DAYS, MONTHS, TOKENS } from '../data/appData';
import { Card, ProgressBar, SectionTitle, StatCard, Tag } from '../components/ui';
import { calculateXp, countDoneHabits, countDoneTasks, formatFocusHours } from '../lib/accountMetrics';

export default function InsightsPage({ habits = [], tasks = [], user, profile }) {
  const doneHabits = countDoneHabits(habits);
  const doneTasks = countDoneTasks(tasks);
  const focusMinutes = profile?.focusMinutes ?? 0;
  const hasActivity = habits.length > 0 || tasks.length > 0 || focusMinutes > 0;
  const weekData = hasActivity ? buildWeeklyFocusSeries(focusMinutes) : Array(7).fill(0);
  const habitData = hasActivity ? buildHabitCompletionSeries(habits, doneHabits) : Array(7).fill(0);
  const focusDistribution = hasActivity ? buildFocusDistribution(habits, tasks, doneHabits, doneTasks) : [];
  const monthData = hasActivity ? buildMonthlyOverview(habits, tasks, profile) : Array(30).fill(0);
  const maxWeek = Math.max(...weekData, 1);
  const maxMonth = Math.max(...monthData, 1);
  const xp = calculateXp(habits, tasks);
  const habitRate = habits.length ? Math.round((doneHabits / habits.length) * 100) : 0;
  const taskRate = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Analytics & Insights" subtitle="Spot patterns and keep improving." />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Focus Hours" value={formatFocusHours(profile?.focusMinutes ?? 0)} color={TOKENS.accent} sub="All-time focus session time" />
        <StatCard label="Habit Rate" value={`${habitRate}%`} color={TOKENS.success} sub={habits.length ? 'Based on current account' : 'No habits yet'} />
        <StatCard label="Task Rate" value={`${taskRate}%`} color={TOKENS.warn} sub={tasks.length ? 'Based on current account' : 'No tasks yet'} />
        <StatCard label="XP Earned" value={xp.total.toLocaleString()} color={TOKENS.energy} sub={`Level ${xp.level} · ${xp.progressToNextLevel} to next`} />
      </div>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Focus Hours by Day</div>
        <div style={{ fontSize: 12, color: TOKENS.muted, marginBottom: 16 }}>This week · quick view</div>
        {!hasActivity ? (
          <div style={{ color: TOKENS.muted, fontSize: 13, padding: '8px 0' }}>No focus sessions yet. Start a Focus Session to fill this chart.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 128 }}>
            {weekData.map((value, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 10, color: TOKENS.muted }}>{value}h</div>
                <div style={{ width: '100%', height: `${(value / maxWeek) * 92}px`, background: index === 6 ? TOKENS.accent : `${TOKENS.accent}44`, borderRadius: '10px 10px 4px 4px' }} />
                <div style={{ fontSize: 10, color: TOKENS.muted }}>{DAYS[index]}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Habit Completion</div>
        <div style={{ fontSize: 12, color: TOKENS.muted, marginBottom: 16 }}>Average completion rate per day</div>
        {!hasActivity ? (
          <div style={{ color: TOKENS.muted, fontSize: 13, padding: '8px 0' }}>No habits yet. Add one to start tracking completion.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 112 }}>
            {habitData.map((value, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: '100%', height: `${(value / 100) * 82}px`, background: value === 100 ? TOKENS.success : `${TOKENS.success}55`, borderRadius: '10px 10px 4px 4px' }} />
                <div style={{ fontSize: 10, color: TOKENS.muted }}>{DAYS[index]}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <Card>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Focus Distribution</div>
          {focusDistribution.length === 0 ? (
            <div style={{ color: TOKENS.muted, fontSize: 13 }}>No focus distribution yet. Complete a few sessions to populate this view.</div>
          ) : (
            focusDistribution.map(([label, value, color]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                  <span>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{value}%</span>
                </div>
                <ProgressBar value={value} total={100} color={color} height={6} />
              </div>
            ))
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>Focus Hours</div>
            <Tag color={TOKENS.accent}>This week</Tag>
          </div>
          {!hasActivity ? (
            <div style={{ color: TOKENS.muted, fontSize: 13, padding: '8px 0' }}>No focus sessions yet. Start a Focus Session to log time here.</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, minHeight: 128 }}>
              {weekData.map((value, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 10, color: TOKENS.muted }}>{value}h</div>
                  <div style={{ width: '100%', height: `${(value / maxWeek) * 92}px`, background: index === 6 ? TOKENS.accent : `${TOKENS.accent}44`, borderRadius: '10px 10px 4px 4px' }} />
                  <div style={{ fontSize: 10, color: TOKENS.muted }}>{DAYS[index]}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Monthly Overview - {MONTHS[new Date().getMonth()]}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
          {DAYS.map((day) => <div key={day} style={{ textAlign: 'center', fontSize: 10, color: TOKENS.muted }}>{day}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {monthData.map((score, index) => {
            const normalized = score / maxMonth;
            const background = normalized > 0.8 ? TOKENS.accent : normalized > 0.5 ? `${TOKENS.accent}77` : normalized > 0.2 ? `${TOKENS.accent}33` : TOKENS.card2;
            return <div key={index} style={{ aspectRatio: '1', borderRadius: 8, background, display: 'grid', placeItems: 'center', fontSize: 9, color: normalized > 0.8 ? '#fff' : TOKENS.muted }}>{index + 1}</div>;
          })}
        </div>
      </Card>
    </div>
  );
}

function buildWeeklyFocusSeries(totalMinutes) {
  const totalHours = totalMinutes / 60;

  if (totalHours <= 0) {
    return Array(7).fill(0);
  }

  const weights = [0.55, 0.78, 0.42, 1, 0.66, 0.88, 0.72];
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);

  return weights.map((weight) => Number(((totalHours * weight) / weightTotal * 7).toFixed(1)));
}

function buildHabitCompletionSeries(habits, doneHabits) {
  if (habits.length === 0) {
    return Array(7).fill(0);
  }

  const completionRate = Math.round((doneHabits / habits.length) * 100);
  const weights = [0.92, 1.02, 0.76, 1.1, 0.95, 1.0, 0.83];

  return weights.map((weight) => Math.max(0, Math.min(100, Math.round(completionRate * weight))));
}

function buildFocusDistribution(habits, tasks, doneHabits, doneTasks) {
  const habitCompletion = habits.length ? Math.round((doneHabits / habits.length) * 100) : 0;
  const taskCompletion = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const learningHabits = habits.filter((habit) => habit.category === 'Learning').length;

  const deepWork = Math.max(10, Math.min(60, Math.round(habitCompletion * 0.5)));
  const meetings = Math.max(0, Math.min(30, Math.round((100 - taskCompletion) * 0.25)));
  const learning = Math.max(0, Math.min(25, habits.length ? Math.round((learningHabits / habits.length) * 100) : 0));
  const admin = Math.max(0, 100 - deepWork - meetings - learning);

  return [
    ['Deep Work', deepWork, TOKENS.accent],
    ['Meetings', meetings, TOKENS.energy],
    ['Learning', learning, TOKENS.success],
    ['Admin', admin, TOKENS.warn],
  ];
}

function buildMonthlyOverview(habits, tasks, profile) {
  const totalSignals = habits.length + tasks.length + Math.round((profile?.focusMinutes ?? 0) / 30);

  if (totalSignals <= 0) {
    return Array(30).fill(0);
  }

  return Array.from({ length: 30 }, (_, index) => ((index * 17 + totalSignals) % 100) / 100);
}