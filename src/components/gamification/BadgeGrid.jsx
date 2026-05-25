import React from 'react'
import { motion } from 'framer-motion'

export default function BadgeGrid({badges = []}){
  if(!badges.length) return <div className="card p-4 text-muted">No badges unlocked yet.</div>

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {badges.map(badge => (
        <motion.div
          key={badge.id}
          className="card p-4 border border-white/10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-2xl mb-2">🏅</div>
          <div className="font-semibold">{badge.name}</div>
          <div className="text-xs text-muted mt-1">Unlocked</div>
        </motion.div>
      ))}
    </div>
  )
}
