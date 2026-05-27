import { useEffect, useMemo, useRef, useState } from 'react';
import { TOKENS } from '../data/appData';
import { Button, Card, ProgressBar, SectionTitle, Tag } from '../components/ui';

const MODES = [
  { label: 'Pomodoro', duration: 'focus', color: TOKENS.accent },
  { label: 'Short Break', duration: 5 * 60, color: TOKENS.success },
  { label: 'Long Break', duration: 15 * 60, color: TOKENS.warn },
];

const fmt = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function FocusPage({ tasks, profile, setProfile }) {
  const [modeIndex, setModeIndex] = useState(0);
  const focusDuration = profile?.focusDuration ?? 25;
  const breakDuration = profile?.breakDuration ?? 5;
  const getModeDuration = (index) => {
    if (index === 0) return focusDuration * 60;
    if (index === 1) return breakDuration * 60;
    return breakDuration * 3 * 60;
  };

  const [seconds, setSeconds] = useState(getModeDuration(0));
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(2);
  const [selectedTask, setSelectedTask] = useState(tasks.find((task) => !task.done)?.id ?? tasks[0]?.id ?? 0);
  const [soundOn, setSoundOn] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('rain');
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const mode = MODES[modeIndex];
  const totalDuration = getModeDuration(modeIndex);
  const progress = totalDuration > 0 ? 1 - seconds / totalDuration : 0;
  const radius = 100;
  const circumference = useMemo(() => 2 * Math.PI * radius, []);

  const recordFocusTime = (minutes) => {
    if (!setProfile) return;
    setProfile((current) => {
      const safeCurrent = current ?? {};
      return {
        ...safeCurrent,
        focusMinutes: Number(safeCurrent.focusMinutes ?? 0) + minutes,
      };
    });
  };

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
          if (modeIndex === 0) {
            setSessions((value) => value + 1);
            recordFocusTime(focusDuration);
          }
          return totalDuration;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [running, totalDuration]);

  const changeMode = (index) => {
    setModeIndex(index);
    setSeconds(getModeDuration(index));
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(getModeDuration(modeIndex));
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    const audio = audioRef.current;
    if (!audio) return;

    if (next) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const selectTrack = (trackId) => {
    setSelectedTrack(trackId);
    setSoundOn(true);
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    audio.play().catch(() => {});
  };

  const tracks = [
    { id: 'rain', label: 'Rain', src: '/media/rain.mp4', emoji: '🌧', description: 'Soft rain loop' },
    { id: 'waves', label: 'Waves', src: '/media/waves.mp4', emoji: '🌊', description: 'Ocean ambience' },
    { id: 'forest', label: 'Forest', src: '/media/forest.mp4', emoji: '🌿', description: 'Nature ambience' },
    { id: 'cafe', label: 'Cafe', src: '/media/cafe.mp4', emoji: '☕', description: 'Low chatter' },
    { id: 'custom', label: 'Your MP4', src: '/media/music.mp4', emoji: '🎵', description: 'Drop your file here' },
  ];

  const activeTrack = tracks.find((track) => track.id === selectedTrack) ?? tracks[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundOn) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [soundOn, selectedTrack]);

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
              <div style={{ marginTop: 4, fontSize: 12, color: TOKENS.muted }}>{modeIndex === 0 ? `${mode.label} · ${focusDuration} min` : `${mode.label} · ${modeIndex === 1 ? breakDuration : breakDuration * 3} min`}</div>
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
          <Button variant="ghost" onClick={toggleSound}>♫</Button>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13, color: TOKENS.muted }}>
          <Tag color={TOKENS.success}>Sessions today: {sessions}</Tag>
          <Tag color={mode.color}>Timer mode: {mode.label}</Tag>
          <Tag color={soundOn ? TOKENS.accent : TOKENS.muted}>{soundOn ? `Playing ${activeTrack.label}` : 'Sound off'}</Tag>
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
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => selectTrack(track.id)}
              style={{
                ...soundChipStyle,
                border: `1px solid ${selectedTrack === track.id ? TOKENS.accent : TOKENS.border}`,
                background: selectedTrack === track.id ? `${TOKENS.accent}18` : TOKENS.card2,
              }}
            >
              {track.emoji} {track.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: TOKENS.muted, lineHeight: 1.6 }}>
          Put your MP4 file in <span style={{ color: TOKENS.text }}>public/media/music.mp4</span>. The app will stream it in the focus player.
        </div>
        <audio ref={audioRef} src={activeTrack.src} loop preload="auto" />
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