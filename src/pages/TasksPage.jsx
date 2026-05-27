import { useMemo, useState } from 'react';
import { TOKENS } from '../data/appData';
import { Button, Card, SectionTitle, Tag } from '../components/ui';

export default function TasksPage({ tasks, setTasks }) {
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [newTag, setNewTag] = useState('Work');
  const [newPriority, setNewPriority] = useState('medium');

  const addTask = () => {
    if (!newTask.trim()) return;

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        text: newTask.trim(),
        done: false,
        tag: newTag,
        priority: newPriority,
      },
    ]);

    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const deleteTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const filtered = useMemo(() => {
    if (filter === 'done') return tasks.filter((task) => task.done);
    if (filter === 'pending') return tasks.filter((task) => !task.done);
    return tasks;
  }, [filter, tasks]);

  const priorityColor = {
    high: TOKENS.energy,
    medium: TOKENS.warn,
    low: TOKENS.muted,
  };

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Task Manager" subtitle="Capture work, ideas, and next actions." />

      <Card style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTask()} placeholder="Add a new task" style={{ ...inputStyle, flex: 1, minWidth: 220 }} />
          <select value={newTag} onChange={(event) => setNewTag(event.target.value)} style={inputStyle}>
            {['Work', 'Dev', 'Learning', 'Health', 'Personal'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={newPriority} onChange={(event) => setNewPriority(event.target.value)} style={inputStyle}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button onClick={addTask}>+ Add</Button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'pending', 'done'].map((item) => (
            <button key={item} onClick={() => setFilter(item)} style={filterChip(filter === item)}>
              {item}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: TOKENS.muted, alignSelf: 'center' }}>
            {tasks.filter((task) => task.done).length}/{tasks.length} done
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((task) => (
          <div key={task.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px', background: TOKENS.card, borderRadius: 16, border: `1px solid ${TOKENS.border}`, borderLeft: `3px solid ${priorityColor[task.priority]}` }}>
            <button onClick={() => toggleTask(task.id)} style={checkboxStyle(task.done)}>{task.done ? '✓' : ''}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? TOKENS.muted : TOKENS.text, marginBottom: 6 }}>
                {task.text}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Tag>{task.tag}</Tag>
                <Tag color={priorityColor[task.priority]}>{task.priority}</Tag>
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} style={deleteButtonStyle}>✕</button>
          </div>
        ))}

        {filtered.length === 0 ? <div style={{ textAlign: 'center', color: TOKENS.muted, padding: 40, fontSize: 14 }}>No tasks here yet.</div> : null}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '11px 14px',
  borderRadius: 14,
  background: TOKENS.card2,
  border: `1px solid ${TOKENS.border}`,
  color: TOKENS.text,
  outline: 'none',
};

const filterChip = (active) => ({
  padding: '7px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  background: active ? TOKENS.accent : TOKENS.card2,
  color: active ? '#fff' : TOKENS.muted,
  border: 'none',
  textTransform: 'capitalize',
});

const checkboxStyle = (checked) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  border: `2px solid ${checked ? TOKENS.success : TOKENS.muted}`,
  background: checked ? TOKENS.success : 'transparent',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  fontWeight: 800,
  color: '#050505',
});

const deleteButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: TOKENS.muted,
  cursor: 'pointer',
  fontSize: 16,
  padding: '6px 8px',
  borderRadius: 8,
  flexShrink: 0,
};