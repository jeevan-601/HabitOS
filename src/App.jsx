import { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { initialHabits, initialTasks } from './data/appData';
import { readJSON, writeJSON } from './hooks/usePersistentState';
import { AppShell } from './components/Shell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FocusPage from './pages/FocusPage';
import HabitsPage from './pages/HabitsPage';
import TasksPage from './pages/TasksPage';
import InsightsPage from './pages/InsightsPage';
import SocialPage from './pages/SocialPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';

const storageKey = (email, name) => `habitos.${email}.${name}`;
const getIsMobile = () => (typeof window !== 'undefined' ? window.innerWidth < 768 : false);
const VALID_PAGES = new Set(['dashboard', 'focus', 'habits', 'tasks', 'insights', 'social', 'achievements', 'settings']);

const pageFromHash = () => {
  if (typeof window === 'undefined') return 'dashboard';
  const raw = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  return VALID_PAGES.has(raw) ? raw : 'dashboard';
};

const pageToHash = (page) => `#/${page}`;

export default function App() {
  const { user, ready, login, signup, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(getIsMobile());
  const [habits, setHabits] = useState(initialHabits);
  const [tasks, setTasks] = useState(initialTasks);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const nextPage = pageFromHash();
      if (VALID_PAGES.has(nextPage)) {
        setActivePage(nextPage);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!user) {
      hydratedRef.current = false;
      return;
    }

    hydratedRef.current = false;
    setHabits(readJSON(storageKey(user.email, 'habits'), initialHabits));
    setTasks(readJSON(storageKey(user.email, 'tasks'), initialTasks));
    setActivePage(pageFromHash() || readJSON(storageKey(user.email, 'page'), 'dashboard'));
    setSidebarCollapsed(readJSON(storageKey(user.email, 'collapsed'), false));
    hydratedRef.current = true;
  }, [user]);

  useEffect(() => {
    if (!user || !hydratedRef.current) return;
    writeJSON(storageKey(user.email, 'habits'), habits);
    writeJSON(storageKey(user.email, 'tasks'), tasks);
    writeJSON(storageKey(user.email, 'page'), activePage);
    writeJSON(storageKey(user.email, 'collapsed'), sidebarCollapsed);
  }, [activePage, habits, sidebarCollapsed, tasks, user]);

  useEffect(() => {
    if (!user) return;
    const hashPage = pageFromHash();
    if (hashPage !== activePage) {
      window.history.replaceState(null, '', pageToHash(activePage));
    }
  }, [activePage, user]);

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage onLogin={login} onSignup={signup} />;
  }

  const pageProps = { habits, setHabits, tasks, setTasks, setPage: setActivePage };

  return (
    <AppShell
      user={user}
      activePage={activePage}
      setActivePage={setActivePage}
      collapsed={sidebarCollapsed}
      setCollapsed={setSidebarCollapsed}
      onLogout={logout}
      isMobile={isMobile}
    >
      {activePage === 'dashboard' ? <DashboardPage {...pageProps} /> : null}
      {activePage === 'focus' ? <FocusPage {...pageProps} /> : null}
      {activePage === 'habits' ? <HabitsPage {...pageProps} /> : null}
      {activePage === 'tasks' ? <TasksPage {...pageProps} /> : null}
      {activePage === 'insights' ? <InsightsPage /> : null}
      {activePage === 'social' ? <SocialPage /> : null}
      {activePage === 'achievements' ? <AchievementsPage /> : null}
      {activePage === 'settings' ? <SettingsPage /> : null}
    </AppShell>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text)', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, margin: '0 auto 14px', background: 'linear-gradient(135deg, var(--accent), var(--energy))' }} />
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700 }}>Loading HabitOS</div>
      </div>
    </div>
  );
}