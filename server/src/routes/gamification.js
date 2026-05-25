const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { pool } = require('../db')

function difficultyXp(difficulty){
  if(difficulty === 'hard') return 40
  if(difficulty === 'easy') return 10
  return 20
}

function uniqueDays(rows){
  return [...new Set(rows.map(row => new Date(row.occurred_at).toDateString()))]
}

function computeStreak(days){
  let streak = 0
  const current = new Date()
  current.setHours(0, 0, 0, 0)

  while(true){
    const key = current.toDateString()
    if(days.includes(key)){
      streak += 1
      current.setDate(current.getDate() - 1)
      continue
    }
    break
  }
  return streak
}

router.get('/', auth, async (req, res) => {
  const [habitRows, logRows, sessionRows] = await Promise.all([
    pool.query('SELECT id, meta FROM habits WHERE user_id=$1', [req.user.id]),
    pool.query('SELECT occurred_at, habit_id FROM habit_logs WHERE user_id=$1 ORDER BY occurred_at DESC', [req.user.id]),
    pool.query('SELECT duration_minutes FROM focus_sessions WHERE user_id=$1', [req.user.id])
  ])

  const habits = habitRows.rows
  const logs = logRows.rows
  const sessions = sessionRows.rows

  const habitDifficultyById = new Map(habits.map(h => [h.id, h.meta?.difficulty || 'medium']))
  const habitCompletions = logs.length
  const habitXp = logs.reduce((sum, log) => sum + difficultyXp(habitDifficultyById.get(log.habit_id)), 0)
  const focusXp = sessions.reduce((sum, session) => sum + Number(session.duration_minutes || 0), 0)
  const totalXp = habitXp + focusXp
  const level = Math.min(100, Math.floor(totalXp / 100) + 1)
  const currentStreak = computeStreak(uniqueDays(logs))
  const totalFocusMinutes = sessions.reduce((sum, session) => sum + Number(session.duration_minutes || 0), 0)
  const badges = []

  if(habits.length >= 1) badges.push({ id: 'first-habit', name: 'First Habit', unlocked: true })
  if(currentStreak >= 7) badges.push({ id: 'streak-7', name: '7 Day Streak', unlocked: true })
  if(currentStreak >= 30) badges.push({ id: 'streak-30', name: '30 Day Streak', unlocked: true })
  if(habitCompletions >= 100) badges.push({ id: 'centurion', name: 'Centurion', unlocked: true })
  if(totalFocusMinutes >= 600) badges.push({ id: 'focus-master', name: 'Focus Master', unlocked: true })
  if(habits.filter(h => h.meta?.category === 'Health').length >= 3) badges.push({ id: 'health-runner', name: 'Health Runner', unlocked: true })

  res.json({
    xp: totalXp,
    level,
    nextLevelXp: level * 100,
    currentStreak,
    habitCompletions,
    totalFocusMinutes,
    badges,
    levelName: level >= 50 ? 'Legend' : level >= 25 ? 'Master' : level >= 10 ? 'Adept' : 'Novice'
  })
})

module.exports = router
