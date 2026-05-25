const crypto = require('crypto')

function createRequestLogger(){
  return (req, res, next) => {
    const startedAt = Date.now()
    const requestId = req.headers['x-request-id'] || crypto.randomUUID()
    req.requestId = requestId
    res.setHeader('x-request-id', requestId)

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
      const payload = {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        userId: req.user?.id || null
      }

      if(level === 'error') console.error('[request]', JSON.stringify(payload))
      else if(level === 'warn') console.warn('[request]', JSON.stringify(payload))
      else console.log('[request]', JSON.stringify(payload))
    })

    next()
  }
}

async function recordTelemetry(pool, event = {}){
  const {
    userId = null,
    type,
    name,
    level = 'info',
    source = 'client',
    details = {}
  } = event

  if(!type || !name) return null

  const result = await pool.query(
    `INSERT INTO telemetry_events (user_id, type, name, level, source, details)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, type, name, level, source, details]
  )

  return result.rows[0]
}

async function telemetrySummary(pool, userId, days = 7){
  const isSqlite = pool.dialect === 'sqlite'
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [events, errors, recent] = isSqlite ? await Promise.all([
    pool.query(
      `SELECT type, name, level, source, created_at
       FROM telemetry_events
       WHERE user_id = ? AND datetime(created_at) >= datetime(?)
       ORDER BY created_at DESC`,
      [userId, since]
    ),
    pool.query(
      `SELECT count(*) AS total
       FROM telemetry_events
       WHERE user_id = ? AND level = 'error' AND datetime(created_at) >= datetime(?)`,
      [userId, since]
    ),
    pool.query(
      `SELECT substr(created_at, 1, 10) AS day,
              count(*) AS total,
              sum(CASE WHEN level = 'error' THEN 1 ELSE 0 END) AS errors
       FROM telemetry_events
       WHERE user_id = ? AND datetime(created_at) >= datetime(?)
       GROUP BY day
       ORDER BY day DESC`,
      [userId, since]
    )
  ]) : await Promise.all([
    pool.query(
      `SELECT type, name, level, source, created_at
       FROM telemetry_events
       WHERE user_id = $1 AND created_at >= now() - ($2 || ' days')::interval
       ORDER BY created_at DESC`,
      [userId, String(days)]
    ),
    pool.query(
      `SELECT count(*)::int AS total
       FROM telemetry_events
       WHERE user_id = $1 AND level = 'error' AND created_at >= now() - ($2 || ' days')::interval`,
      [userId, String(days)]
    ),
    pool.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
              count(*)::int AS total,
              sum(CASE WHEN level = 'error' THEN 1 ELSE 0 END)::int AS errors
       FROM telemetry_events
       WHERE user_id = $1 AND created_at >= now() - ($2 || ' days')::interval
       GROUP BY 1
       ORDER BY 1 DESC`,
      [userId, String(days)]
    )
  ])

  const byType = events.rows.reduce((accumulator, row) => {
    accumulator[row.type] = (accumulator[row.type] || 0) + 1
    return accumulator
  }, {})

  return {
    totalEvents: events.rows.length,
    totalErrors: errors.rows[0]?.total || 0,
    byType,
    daily: recent.rows.reverse(),
    recentEvents: events.rows.slice(0, 12)
  }
}

module.exports = { createRequestLogger, recordTelemetry, telemetrySummary }
