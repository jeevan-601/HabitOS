import { useEffect, useState } from 'react';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function readJSON(key, fallback) {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
}

export function usePersistentState(key, fallback) {
  const [state, setState] = useState(() => readJSON(key, fallback));

  useEffect(() => {
    writeJSON(key, state);
  }, [key, state]);

  return [state, setState];
}