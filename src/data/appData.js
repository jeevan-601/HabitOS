export const TOKENS = {
  bg: '#09090f',
  surface: 'rgba(16, 17, 26, 0.92)',
  card: 'rgba(21, 22, 33, 0.94)',
  card2: 'rgba(31, 32, 45, 0.95)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  accent: '#5d7dff',
  accentHover: '#7f97ff',
  success: '#53d9a7',
  warn: '#f2b84b',
  energy: '#f26b8a',
  text: '#f2f0fb',
  muted: '#8b8a9c',
  muted2: '#575566',
};

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const NAV = [
  { id: 'dashboard', icon: '◫', label: 'Dashboard' },
  { id: 'focus', icon: '⏱', label: 'Focus' },
  { id: 'habits', icon: '✓', label: 'Habits' },
  { id: 'tasks', icon: '☑', label: 'Tasks' },
  { id: 'insights', icon: '◈', label: 'Insights' },
  { id: 'social', icon: '⚡', label: 'Social' },
  { id: 'achievements', icon: '★', label: 'Awards' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
];

export const demoUsers = [
  {
    id: 'demo-alex',
    name: 'Alex Kumar',
    email: 'alex@habitos.app',
    password: 'demo1234',
    color: TOKENS.accent,
    createdAt: '2026-01-01T00:00:00.000Z',
    isDemo: true,
  },
];

export const initialHabits = [
  { id: 1, name: 'Morning Run', icon: '🏃', color: TOKENS.success, streak: 14, target: 1, done: true, category: 'Health' },
  { id: 2, name: 'Read 20 min', icon: '📚', color: TOKENS.accent, streak: 9, target: 1, done: true, category: 'Learning' },
  { id: 3, name: 'Drink Water', icon: '💧', color: TOKENS.warn, streak: 21, target: 8, done: 6, category: 'Health' },
  { id: 4, name: 'Meditate', icon: '🧘', color: TOKENS.energy, streak: 3, target: 1, done: false, category: 'Wellness' },
  { id: 5, name: 'Cold Shower', icon: '🚿', color: '#5cbffa', streak: 7, target: 1, done: true, category: 'Health' },
  { id: 6, name: 'Journal', icon: '✍️', color: '#d45cfa', streak: 5, target: 1, done: false, category: 'Wellness' },
];

export const initialTasks = [
  { id: 1, text: 'Design landing page wireframe', done: true, tag: 'Work', priority: 'high' },
  { id: 2, text: 'Write unit tests for auth module', done: false, tag: 'Dev', priority: 'high' },
  { id: 3, text: 'Review pull requests', done: false, tag: 'Dev', priority: 'medium' },
  { id: 4, text: 'Read chapter 4 of Atomic Habits', done: false, tag: 'Learning', priority: 'low' },
  { id: 5, text: 'Send weekly report to manager', done: true, tag: 'Work', priority: 'medium' },
];

export const leaderboard = [
  { rank: 1, name: 'Riya K.', country: '🇮🇳', hours: 32, xp: 4200 },
  { rank: 2, name: 'Marco J.', country: '🇧🇷', hours: 28, xp: 3800 },
  { rank: 3, name: 'Aiko K.', country: '🇯🇵', hours: 25, xp: 3400 },
  { rank: 4, name: 'Lena M.', country: '🇩🇪', hours: 23, xp: 3100 },
  { rank: 5, name: 'Carlos R.', country: '🇲🇽', hours: 21, xp: 2900 },
  { rank: 6, name: 'Priya S.', country: '🇮🇳', hours: 20, xp: 2750 },
  { rank: 7, name: 'James T.', country: '🇺🇸', hours: 18, xp: 2500 },
  { rank: 8, name: 'You', country: '🌟', hours: 16, xp: 2450, isYou: true },
];

export const badges = [
  { icon: '🔥', name: '14-Day Streak', desc: 'Habit consistency', earned: true, color: TOKENS.warn },
  { icon: '🎯', name: '100 Sessions', desc: 'Focus milestone', earned: true, color: TOKENS.accent },
  { icon: '🌙', name: 'Night Owl', desc: 'Late focus master', earned: true, color: TOKENS.energy },
  { icon: '💧', name: 'Hydration Hero', desc: '8 cups 30 days', earned: true, color: '#5cbffa' },
  { icon: '📚', name: 'Bookworm', desc: 'Read 20 books', earned: false, color: TOKENS.success },
  { icon: '🏆', name: 'Top 1%', desc: 'Global leaderboard', earned: false, color: TOKENS.warn },
  { icon: '⚡', name: 'Speed Runner', desc: '10h in one day', earned: false, color: TOKENS.accent },
  { icon: '🌍', name: 'Global Legend', desc: 'Rank #1 worldwide', earned: false, color: TOKENS.energy },
];

export const defaultProfile = (user) => ({
  createdAt: user?.createdAt ?? new Date().toISOString(),
  isDemo: Boolean(user?.isDemo),
  focusMinutes: 0,
  focusDuration: 25,
  focusDurationSeconds: 25 * 60,
  breakDuration: 5,
});