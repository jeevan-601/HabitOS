import { useEffect, useMemo, useRef, useState } from 'react';
import { TOKENS } from '../data/appData';
import { Button, Card, ProgressBar, SectionTitle, Tag } from '../components/ui';

const MODES = [
  { label: 'Focus', duration: 25 * 60, color: TOKENS.accent },
  { label: 'Short Break', duration: 5 * 60, color: TOKENS.success },
  { label: 'Long Break', duration: 15 * 60, color: TOKENS.warn },
];

const fmt = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function FocusPage({ tasks }) {
  const [modeIndex, setModeIndex] = useState(0);
  const [seconds, setSeconds] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(2);
  const [selectedTask, setSelectedTask] = useState(tasks.find((task) => !task.done)?.id ?? tasks[0]?.id ?? 0);
  const [soundOn, setSoundOn] = useState(false);
  const timerRef = useRef(null);

  const mode = MODES[modeIndex];
  const totalDuration = mode.duration;
  const progress = totalDuration > 0 ? 1 - seconds / totalDuration : 0;
  const radius = 100;
  const circumference = useMemo(() => 2 * Math.PI * radius, []);

  useEffect(() => {
    if (!running) {
      window.clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timerRef.current);
          setRunning(false);
          setSessions((value) => value + 1);
          return totalDuration;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [running, totalDuration]);

  const changeMode = (index) => {
    setModeIndex(index);
    setSeconds(MODES[index].duration);
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(mode.duration);
  };

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Focus Timer" subtitle="Stay on one task and protect your attention." />

      <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '30px 22px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {MODES.map((item, index) => (
            <button
              key={item.label}
              onClick={() => changeMode(index)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: `1px solid ${modeIndex === index ? item.color : TOKENS.border}`,
                background: modeIndex === index ? `${item.color}16` : TOKENS.card2,
                color: modeIndex === index ? item.color : TOKENS.muted,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 'min(100%, 280px)', aspectRatio: '1' }}>
          <svg width="100%" height="100%" viewBox="0 0 240 240" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="120" cy="120" r={radius} fill="none" stroke={TOKENS.card2} strokeWidth="10" />
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke={mode.color}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.35s ease' }}
            />
          </svg>

          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(44px, 8vw, 58px)', fontWeight: 700, color: mode.color, letterSpacing: '-0.05em' }}>{fmt(seconds)}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: TOKENS.muted }}>{mode.label}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
                {[1, 2, 3, 4].map((dot) => (
                  <div key={dot} style={{ width: 7, height: 7, borderRadius: '50%', background: dot <= sessions % 4 ? mode.color : TOKENS.card2 }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="ghost" onClick={reset}>↺</Button>
          <Button onClick={() => setRunning((value) => !value)} size="lg" style={{ width: 72, height: 72, borderRadius: '50%', fontSize: 24 }}>
            {running ? '⏸' : '▶'}
          </Button>
          <Button variant="ghost" onClick={() => setSoundOn((value) => !value)}>♫</Button>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13, color: TOKENS.muted }}>
          <Tag color={TOKENS.success}>Sessions today: {sessions}</Tag>
          <Tag color={mode.color}>Timer mode: {mode.label}</Tag>
          <Tag color={soundOn ? TOKENS.accent : TOKENS.muted}>{soundOn ? 'Sound on' : 'Sound off'}</Tag>
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Focus on task</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {tasks.filter((task) => !task.done).map((task) => {
            const active = selectedTask === task.id;
            return (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  padding: '13px 14px',
                  borderRadius: 14,
                  border: `1px solid ${active ? `${TOKENS.accent}55` : TOKENS.border}`,
                  background: active ? `${TOKENS.accent}14` : TOKENS.card2,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 16, height: 16, marginTop: 2, borderRadius: '50%', border: `2px solid ${active ? TOKENS.accent : TOKENS.muted}`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>{task.text}</div>
                  <div style={{ marginTop: 8 }}>
                    <Tag color={task.priority === 'high' ? TOKENS.energy : task.priority === 'medium' ? TOKENS.warn : TOKENS.muted}>{task.priority}</Tag>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <ProgressBar value={sessions % 4} total={4} color={mode.color} />
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Ambient sound</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['🌧 Rain', '🌊 Waves', '🌿 Forest', '☕ Café', '🎵 Lo-fi', '⬜ White noise'].map((item) => (
            <button key={item} style={soundChipStyle}>{item}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

const soundChipStyle = {
  padding: '9px 14px',
  borderRadius: 999,
  background: TOKENS.card2,
  border: `1px solid ${TOKENS.border}`,
  color: TOKENS.text,
  cursor: 'pointer',
};