import { useEffect, useMemo, useRef, useState } from 'react';
import { TOKENS } from '../data/appData';
import { Button, Card, ProgressBar, SectionTitle, Tag } from '../components/ui';

const MODES = [
  { label: 'Focus Session', duration: 'focus', color: TOKENS.accent },
  { label: 'Short Break', duration: 5 * 60, color: TOKENS.success },
  { label: 'Long Break', duration: 15 * 60, color: TOKENS.warn },
];

const fmt = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

function getModeDurationSeconds(index, focusDurationSeconds, shortBreakDurationSeconds, longBreakDurationSeconds) {
  if (index === 0) return focusDurationSeconds;
  if (index === 1) return shortBreakDurationSeconds;
  return longBreakDurationSeconds;
}

export default function FocusPage({ tasks, profile, setProfile }) {
  const [modeIndex, setModeIndex] = useState(0);
  const focusDurationSeconds = profile?.focusDurationSeconds ?? ((profile?.focusDuration ?? 25) * 60);
  const shortBreakDurationSeconds = profile?.shortBreakDurationSeconds ?? ((profile?.breakDuration ?? 5) * 60);
  const longBreakDurationSeconds = profile?.longBreakDurationSeconds ?? (15 * 60);
  const [focusInput, setFocusInput] = useState(formatDurationInput(focusDurationSeconds));
  const [shortBreakInput, setShortBreakInput] = useState(formatDurationInput(shortBreakDurationSeconds));
  const [longBreakInput, setLongBreakInput] = useState(formatDurationInput(longBreakDurationSeconds));
  const alertAudioRef = useRef(null);
  const nextModeIndexRef = useRef(null);

  const getModeDuration = (index) => {
    return getModeDurationSeconds(index, focusDurationSeconds, shortBreakDurationSeconds, longBreakDurationSeconds);
  };

  const [seconds, setSeconds] = useState(getModeDuration(0));
  const [running, setRunning] = useState(false);
  // FIX: sessions starts at 0, not 2
  const [sessions, setSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState(tasks.find((task) => !task.done)?.id ?? tasks[0]?.id ?? 0);
  const [justFinished, setJustFinished] = useState(false);
  const timerRef = useRef(null);
  

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

  const updateFocusDuration = (value) => {
    const nextDuration = Number.isFinite(value) ? Math.max(1, Math.min(12 * 60 * 60, value)) : 1;
    if (!setProfile) return;

    setProfile((current) => ({
      ...(current ?? {}),
      focusDuration: Math.max(1, Math.round(nextDuration / 60)),
      focusDurationSeconds: nextDuration,
    }));

    if (modeIndex === 0 && !running) {
      setSeconds(nextDuration);
    }
  };

  const updateShortBreakDuration = (value) => {
    const nextDuration = Number.isFinite(value) ? Math.max(1, Math.min(12 * 60 * 60, value)) : 1;
    if (!setProfile) return;

    setProfile((current) => ({
      ...(current ?? {}),
      breakDuration: Math.max(1, Math.round(nextDuration / 60)),
      shortBreakDurationSeconds: nextDuration,
    }));

    if (modeIndex === 1 && !running) {
      setSeconds(nextDuration);
    }
  };

  const updateLongBreakDuration = (value) => {
    const nextDuration = Number.isFinite(value) ? Math.max(1, Math.min(12 * 60 * 60, value)) : 1;
    if (!setProfile) return;

    setProfile((current) => ({
      ...(current ?? {}),
      longBreakDurationSeconds: nextDuration,
    }));

    if (modeIndex === 2 && !running) {
      setSeconds(nextDuration);
    }
  };

  const commitFocusInput = (value) => {
    const parsedSeconds = parseDurationInput(value);
    if (parsedSeconds === null) {
      setFocusInput(formatDurationInput(focusDurationSeconds));
      return;
    }

    updateFocusDuration(parsedSeconds);
    setFocusInput(formatDurationInput(parsedSeconds));
  };

  useEffect(() => {
    setFocusInput(formatDurationInput(focusDurationSeconds));
  }, [focusDurationSeconds]);

  useEffect(() => {
    setShortBreakInput(formatDurationInput(shortBreakDurationSeconds));
  }, [shortBreakDurationSeconds]);

  useEffect(() => {
    setLongBreakInput(formatDurationInput(longBreakDurationSeconds));
  }, [longBreakDurationSeconds]);

  const playAlertAndQueueNext = (nextModeIndex) => {
    nextModeIndexRef.current = nextModeIndex;
    const audio = alertAudioRef.current;

    if (!audio) {
      handleAlertEnded();
      return;
    }

    audio.currentTime = 0;
    const playback = audio.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(() => handleAlertEnded());
    }
  };

  const handleAlertEnded = () => {
    const nextModeIndex = nextModeIndexRef.current;
    if (nextModeIndex === null) return;

    nextModeIndexRef.current = null;
    setModeIndex(nextModeIndex);
    setSeconds(getModeDurationSeconds(nextModeIndex, focusDurationSeconds, shortBreakDurationSeconds, longBreakDurationSeconds));
    setJustFinished(false);
    setRunning(true);
  };

  const stopAlert = () => {
    const audio = alertAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    nextModeIndexRef.current = null;
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
          setJustFinished(true);

          if (modeIndex === 0) {
            recordFocusTime(focusDurationSeconds / 60);
            const nextSessionCount = sessions + 1;
            const nextModeIndex = nextSessionCount % 4 === 0 ? 2 : 1;
            setSessions(nextSessionCount);
            if (Notification.permission === 'granted') {
              new Notification('HabitOS', {
                body: nextModeIndex === 1 ? '✅ Focus session complete! Short break starts now.' : '✅ Focus session complete! Long break starts now.',
                icon: '/favicon.ico',
              });
            }
            playAlertAndQueueNext(nextModeIndex);
          } else if (modeIndex === 1) {
            if (Notification.permission === 'granted') {
              new Notification('HabitOS', {
                body: '🎯 Short break over. Focus session starts now.',
                icon: '/favicon.ico',
              });
            }
            playAlertAndQueueNext(0);
          } else {
            if (Notification.permission === 'granted') {
              new Notification('HabitOS', {
                body: '🛌 Long break over. Back to focus session.',
                icon: '/favicon.ico',
              });
            }
            playAlertAndQueueNext(0);
          }
          return getModeDuration(modeIndex);
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, totalDuration, modeIndex, focusDurationSeconds, shortBreakDurationSeconds, longBreakDurationSeconds, sessions]);

  // Request notification permission on first start
  const handleStart = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    stopAlert();
    setJustFinished(false);
    setRunning((value) => !value);
  };

  const changeMode = (index) => {
    stopAlert();
    setModeIndex(index);
    setSeconds(getModeDuration(index));
    setRunning(false);
    setJustFinished(false);
  };

  const reset = () => {
    stopAlert();
    setRunning(false);
    setJustFinished(false);
    setSeconds(getModeDuration(modeIndex));
  };

  

  return (
    <div className="app-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle title="Focus Timer" subtitle="Stay on one task and protect your attention." />

      {/* Timer finished banner */}
      {justFinished && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 14,
          background: `${TOKENS.success}18`,
          border: `1px solid ${TOKENS.success}44`,
          color: TOKENS.success,
          fontWeight: 700,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          {modeIndex === 0
            ? `Focus session complete! +${fmt(focusDurationSeconds)} logged. Take a break.`
            : 'Break over — ready to focus again?'}
        </div>
      )}

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
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(44px, 8vw, 58px)', fontWeight: 700, color: mode.color, letterSpacing: '-0.05em', userSelect: 'none' }}>
                {fmt(seconds)}
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: TOKENS.muted }}>{mode.label} · duration</span>
                {modeIndex === 0 ? (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: TOKENS.muted, fontSize: 12 }}>
                    <span>Set</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9:]*"
                      value={focusInput}
                      onChange={(event) => setFocusInput(sanitizeDurationInput(event.target.value))}
                      onBlur={(event) => commitFocusInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.currentTarget.blur();
                        }
                      }}
                      aria-label="Focus session duration"
                      placeholder="00:45"
                      style={{
                        width: 88,
                        padding: '6px 10px',
                        borderRadius: 12,
                        border: `1px solid ${TOKENS.border}`,
                        background: TOKENS.card2,
                        color: TOKENS.text,
                        font: 'inherit',
                        textAlign: 'center',
                        letterSpacing: '0.02em',
                      }}
                    />
                    <span>mm:ss</span>
                  </label>
                ) : null}
                {modeIndex === 1 ? (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: TOKENS.muted, fontSize: 12 }}>
                    <span>Set</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9:]*"
                      value={shortBreakInput}
                      onChange={(event) => setShortBreakInput(sanitizeDurationInput(event.target.value))}
                      onBlur={(event) => {
                        const parsedSeconds = parseDurationInput(event.target.value);
                        if (parsedSeconds === null) {
                          setShortBreakInput(formatDurationInput(shortBreakDurationSeconds));
                          return;
                        }
                        updateShortBreakDuration(parsedSeconds);
                        setShortBreakInput(formatDurationInput(parsedSeconds));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.currentTarget.blur();
                        }
                      }}
                      aria-label="Short break duration"
                      placeholder="05:00"
                      style={{
                        width: 88,
                        padding: '6px 10px',
                        borderRadius: 12,
                        border: `1px solid ${TOKENS.border}`,
                        background: TOKENS.card2,
                        color: TOKENS.text,
                        font: 'inherit',
                        textAlign: 'center',
                        letterSpacing: '0.02em',
                      }}
                    />
                    <span>mm:ss</span>
                  </label>
                ) : null}
                {modeIndex === 2 ? (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: TOKENS.muted, fontSize: 12 }}>
                    <span>Set</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9:]*"
                      value={longBreakInput}
                      onChange={(event) => setLongBreakInput(sanitizeDurationInput(event.target.value))}
                      onBlur={(event) => {
                        const parsedSeconds = parseDurationInput(event.target.value);
                        if (parsedSeconds === null) {
                          setLongBreakInput(formatDurationInput(longBreakDurationSeconds));
                          return;
                        }
                        updateLongBreakDuration(parsedSeconds);
                        setLongBreakInput(formatDurationInput(parsedSeconds));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.currentTarget.blur();
                        }
                      }}
                      aria-label="Long break duration"
                      placeholder="15:00"
                      style={{
                        width: 88,
                        padding: '6px 10px',
                        borderRadius: 12,
                        border: `1px solid ${TOKENS.border}`,
                        background: TOKENS.card2,
                        color: TOKENS.text,
                        font: 'inherit',
                        textAlign: 'center',
                        letterSpacing: '0.02em',
                      }}
                    />
                    <span>mm:ss</span>
                  </label>
                ) : null}
              </div>
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
          <Button onClick={handleStart} size="lg" style={{ width: 72, height: 72, borderRadius: '50%', fontSize: 24 }}>
            {running ? '⏸' : '▶'}
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13, color: TOKENS.muted }}>
          <Tag color={TOKENS.success}>Sessions today: {sessions}</Tag>
          <Tag color={mode.color}>Timer mode: {mode.label}</Tag>
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Focus on task</div>
        {tasks.filter((task) => !task.done).length === 0 ? (
          <div style={{ color: TOKENS.muted, fontSize: 13 }}>No pending tasks. Add some in the Tasks page.</div>
        ) : (
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
        )}
        <div style={{ marginTop: 16 }}>
          <ProgressBar value={sessions % 4} total={4} color={mode.color} />
        </div>
      </Card>

      <audio ref={alertAudioRef} src="/media/alert.mp3" preload="auto" onEnded={handleAlertEnded} />
    </div>
  );
}



function formatDurationInput(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function sanitizeDurationInput(value) {
  const cleaned = value.replace(/[^0-9:]/g, '');
  const parts = cleaned.split(':').slice(0, 2);

  if (parts.length === 1) {
    return parts[0].slice(0, 4);
  }

  const [minutes, seconds] = parts;
  return `${minutes.slice(0, 3)}:${seconds.slice(0, 2)}`;
}

function parseDurationInput(value) {
  const cleaned = sanitizeDurationInput(value).trim();

  if (!cleaned) {
    return null;
  }

  if (!cleaned.includes(':')) {
    const minutes = Number(cleaned);
    return Number.isFinite(minutes) ? minutes * 60 : null;
  }

  const [minutesPart, secondsPart = '0'] = cleaned.split(':');
  const minutes = Number(minutesPart);
  const seconds = Number(secondsPart);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null;
  }

  const clampedSeconds = Math.max(0, Math.min(59, seconds));
  return Math.max(1, minutes * 60 + clampedSeconds);
}
