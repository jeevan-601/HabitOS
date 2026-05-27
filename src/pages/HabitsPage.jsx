import { useMemo, useState } from 'react';
import { DAYS, TOKENS } from '../data/appData';
import { Button, Card, ProgressBar, SectionTitle, Tag } from '../components/ui';

export default function HabitsPage({ habits, setHabits }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '⭐', category: 'Health' });

  const doneCount = useMemo(
    () => habits.filter((habit) => habit.done === true || (typeof habit.done === 'number' && habit.done >= habit.target)).length,
    [habits],
  );

  const toggleHabit = (id) => {
    setHabits((current) => current.map((habit) => (habit.id === id ? { ...habit, done: typeof habit.done === 'number' ? (habit.done >= habit.target ? 0 : habit.target) : !habit.done } : habit)));
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;

    setHabits((current) => [
      ...current,
      {
        id: Date.now(),
        name: newHabit.name.trim(),
        icon: newHabit.icon.trim() || '⭐',
        color: TOKENS.accent,
        streak: 0,
        target: 1,
        done: false,
        category: newHabit.category,
      },
    ]);

    setNewHabit({ name: '', icon: '⭐', category: 'Health' });
    setShowAdd(false);
  };

  const heatmap = useMemo(() => Array.from({ length: 35 }, (_, index) => ((index * 3) % 5)), []);

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        title="Habit Tracker"
        subtitle={`${doneCount}/${habits.length} habits completed today`}
        action={<Button onClick={() => setShowAdd(true)}>+ Add habit</Button>}
      />

      <Card style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: TOKENS.muted }}>Daily progress</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.success }}>{Math.round((doneCount / habits.length) * 100)}%</div>
        </div>
        <ProgressBar value={doneCount} total={habits.length} color={TOKENS.success} height={8} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {habits.map((habit) => {
          const completed = habit.done === true || (typeof habit.done === 'number' && habit.done >= habit.target);
          const progress = habit.done === true ? habit.target : habit.done || 0;

          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              style={{
                display: 'flex',
                gap: 14,
                padding: '16px 18px',
                borderRadius: 16,
                cursor: 'pointer',
                background: TOKENS.card,
                border: `1px solid ${completed ? `${habit.color}44` : TOKENS.border}`,
                borderLeft: `3px solid ${completed ? habit.color : TOKENS.muted2}`,
                opacity: completed ? 1 : 0.92,
                textAlign: 'left',
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 14, background: `${habit.color}20`, display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0 }}>
                {habit.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{habit.name}</div>
                  {completed ? <span style={{ color: habit.color, fontSize: 12 }}>✓</span> : null}
                </div>
                <div style={{ fontSize: 11, color: TOKENS.muted, marginBottom: 8 }}>🔥 {habit.streak} day streak · {habit.category}</div>
                {typeof habit.done === 'number' ? <ProgressBar value={progress} total={habit.target} color={habit.color} /> : null}
              </div>
            </button>
          );
        })}
      </div>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Activity heatmap</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          {DAYS.map((day) => (
            <div key={day} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: TOKENS.muted }}>{day}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {heatmap.map((value, index) => {
            const colors = ['transparent', `${TOKENS.accent}25`, `${TOKENS.accent}50`, `${TOKENS.accent}85`, TOKENS.accent];
            return <div key={index} style={{ aspectRatio: '1', borderRadius: 6, background: colors[value], border: `1px solid ${TOKENS.border}` }} />;
          })}
        </div>
      </Card>

      {showAdd ? (
        <div style={modalBackdrop}>
          <Card style={{ width: '100%', maxWidth: 420, animation: 'floatIn 0.18s ease both' }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 18 }}>New habit</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input value={newHabit.name} onChange={(event) => setNewHabit((prev) => ({ ...prev, name: event.target.value }))} placeholder="Habit name" style={inputStyle} />
              <input value={newHabit.icon} onChange={(event) => setNewHabit((prev) => ({ ...prev, icon: event.target.value }))} placeholder="Emoji icon" style={inputStyle} />
              <select value={newHabit.category} onChange={(event) => setNewHabit((prev) => ({ ...prev, category: event.target.value }))} style={inputStyle}>
                {['Health', 'Learning', 'Wellness', 'Productivity', 'Social'].map((category) => <option key={category}>{category}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button onClick={addHabit} style={{ flex: 1 }}>Add</Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
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

const modalBackdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.72)',
  display: 'grid',
  placeItems: 'center',
  padding: 20,
  zIndex: 100,
};