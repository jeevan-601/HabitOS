import { TOKENS } from '../data/appData';

export function isHabitDone(habit) {
  return habit.done === true || (typeof habit.done === 'number' && habit.done >= habit.target);
}

export function isTaskDone(task) {
  return Boolean(task.done);
}

export function countDoneHabits(habits) {
  return habits.filter(isHabitDone).length;
}

export function countDoneTasks(tasks) {
  return tasks.filter(isTaskDone).length;
}

export function calculateXp(habits, tasks) {
  const completedHabits = countDoneHabits(habits);
  const completedTasks = countDoneTasks(tasks);
  const habitXp = completedHabits * 40;
  const taskXp = completedTasks * 25;
  const consistencyBonus = Math.max(0, completedHabits - 3) * 10;
  const total = habitXp + taskXp + consistencyBonus;
  const level = Math.max(1, Math.floor(total / 500) + 1);
  const levelStart = (level - 1) * 500;
  const levelEnd = level * 500;

  return {
    total,
    level,
    levelStart,
    levelEnd,
    progressInLevel: total - levelStart,
    progressToNextLevel: levelEnd - total,
    percentToNextLevel: Math.min(100, ((total - levelStart) / 500) * 100),
  };
}

export function buildAiInsights({ habits, tasks, user }) {
  const doneHabits = countDoneHabits(habits);
  const doneTasks = countDoneTasks(tasks);
  const totalHabits = habits.length || 1;
  const totalTasks = tasks.length || 1;
  const habitRate = doneHabits / totalHabits;
  const taskRate = doneTasks / totalTasks;

  const messages = [];

  if (habitRate >= 0.75) {
    messages.push({
      icon: '🔥',
      msg: 'Great habit consistency. You are maintaining momentum and your streak risk is low.',
      color: TOKENS.success,
    });
  } else {
    messages.push({
      icon: '⚠️',
      msg: 'Habit completion is below target. Add one small win early in the day to reset momentum.',
      color: TOKENS.warn,
    });
  }

  if (taskRate >= 0.5) {
    messages.push({
      icon: '⚡',
      msg: 'Task execution is healthy. Your completed work is now feeding XP steadily.',
      color: TOKENS.accent,
    });
  } else {
    messages.push({
      icon: '🧩',
      msg: 'Tasks are lagging behind. Break one pending item into a 15-minute focus block.',
      color: TOKENS.energy,
    });
  }

  const focusWindow = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'today';
  messages.push({
    icon: '📅',
    msg: `Personalized coaching is active for ${user?.name || 'this account'} since ${focusWindow}.`,
    color: TOKENS.warn,
  });

  return messages.slice(0, 3);
}

export function focusMinutesToHours(minutes) {
  return minutes / 60;
}

export function formatFocusHours(minutes) {
  const hours = focusMinutesToHours(minutes);
  return hours === 0 ? '0h' : `${hours.toFixed(1)}h`;
}