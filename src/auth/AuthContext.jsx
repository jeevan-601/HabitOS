import { createContext, useContext, useEffect, useState } from 'react';
import { demoUsers } from '../data/appData';
import { readJSON, removeKey, writeJSON } from '../hooks/usePersistentState';

const SESSION_KEY = 'habitos.session';
const USERS_KEY = 'habitos.users';

const AuthContext = createContext(null);

const normalizeEmail = (value) => value.trim().toLowerCase();

function seedUsers() {
  const storedUsers = readJSON(USERS_KEY, null);
  if (Array.isArray(storedUsers) && storedUsers.length > 0) return storedUsers;
  writeJSON(USERS_KEY, demoUsers);
  return demoUsers;
}

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const seededUsers = seedUsers();
    setUsers(seededUsers);
    setUser(readJSON(SESSION_KEY, null));
    setReady(true);
  }, []);

  const persistUsers = (nextUsers) => {
    setUsers(nextUsers);
    writeJSON(USERS_KEY, nextUsers);
  };

  const login = ({ email, password }) => {
    const normalized = normalizeEmail(email);
    const match = users.find((entry) => entry.email === normalized && entry.password === password);

    if (!match) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const nextUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      color: match.color,
        createdAt: match.createdAt,
        isDemo: Boolean(match.isDemo),
    };

    setUser(nextUser);
    writeJSON(SESSION_KEY, nextUser);
    return { ok: true };
  };

  const signup = ({ name, email, password, confirm }) => {
    const trimmedName = name.trim();
    const normalized = normalizeEmail(email);

    if (trimmedName.length < 2) {
      return { ok: false, error: 'Enter a longer name.' };
    }

    if (!normalized.includes('@') || !normalized.includes('.')) {
      return { ok: false, error: 'Enter a valid email address.' };
    }

    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }

    if (password !== confirm) {
      return { ok: false, error: 'Passwords do not match.' };
    }

    if (users.some((entry) => entry.email === normalized)) {
      return { ok: false, error: 'That email already exists.' };
    }

    const nextUserRecord = {
      id: crypto.randomUUID(),
      name: trimmedName,
      email: normalized,
      password,
      color: '#5d7dff',
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    const nextUsers = [...users, nextUserRecord];
    persistUsers(nextUsers);

    const sessionUser = {
      id: nextUserRecord.id,
      name: nextUserRecord.name,
      email: nextUserRecord.email,
      color: nextUserRecord.color,
      createdAt: nextUserRecord.createdAt,
      isDemo: false,
    };

    setUser(sessionUser);
    writeJSON(SESSION_KEY, sessionUser);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    removeKey(SESSION_KEY);
  };

  const value = {
    ready,
    user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}