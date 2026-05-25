import React from 'react'
import { motion } from 'framer-motion'

export default function XPBar({xp = 0, level = 1, nextLevelXp = 100, levelName = 'Novice'}){
  const progress = Math.max(0, Math.min(100, (xp / nextLevelXp) * 100))

  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Level {level}</div>
          <div className="font-heading text-lg">{levelName}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">XP</div>
          <div className="font-semibold">{xp} / {nextLevelXp}</div>
        </div>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  )
}
