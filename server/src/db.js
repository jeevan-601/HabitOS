const path = require('path')
const { DatabaseSync } = require('node:sqlite')
const { Pool } = require('pg')
const { DATABASE_URL, USE_SQLITE } = require('./config')

function serializeParam(value){
  if(value === undefined) return null
  if(value === null) return null
  if(value instanceof Date) return value.toISOString()
  if(typeof value === 'object') return JSON.stringify(value)
  return value
}

function deserializeRow(row){
  if(!row) return row
  const parsed = { ...row }
  for(const key of ['meta', 'details']){
    if(typeof parsed[key] === 'string'){
      try{
        parsed[key] = JSON.parse(parsed[key])
      }catch(e){}
    }
  }
  return parsed
}

function normalizeSql(sql){
  return sql
    .replace(/\$([0-9]+)/g, '?')
    .replace(/\bnow\(\)/gi, 'CURRENT_TIMESTAMP')
}

function normalizeSchemaSql(sql){
  return normalizeSql(sql)
    .replace(/SERIAL\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/\bJSONB\b/gi, 'TEXT')
    .replace(/TIMESTAMP\s+DEFAULT\s+CURRENT_TIMESTAMP/gi, 'TEXT DEFAULT CURRENT_TIMESTAMP')
}

class SqlitePool {
  constructor(filePath){
    this.dialect = 'sqlite'
    this.db = new DatabaseSync(filePath)
    this.db.exec('PRAGMA foreign_keys = ON')
  }

  async query(text, params = []){
    const sql = String(text).trim()
    const values = params.map(serializeParam)

    if(/^(create|drop|alter)\s+/i.test(sql) || sql.includes(';')){
      this.db.exec(normalizeSchemaSql(sql))
      return { rows: [], rowCount: 0 }
    }

    const normalized = normalizeSql(sql)
    const stmt = this.db.prepare(normalized)

    if(/^(select|with|pragma)\s+/i.test(normalized) || /\breturning\b/i.test(normalized)){
      const rows = stmt.all(...values).map(deserializeRow)
      return { rows, rowCount: rows.length }
    }

    const result = stmt.run(...values)
    return { rows: [], rowCount: result.changes, lastInsertId: result.lastInsertRowid }
  }
}

let pool

if(USE_SQLITE){
  const sqlitePath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'habitos.sqlite3')
  pool = new SqlitePool(sqlitePath)
}else{
  pool = new Pool({ connectionString: DATABASE_URL })
  pool.dialect = 'postgres'
}

async function init(){
  if(pool.dialect === 'sqlite'){
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        meta TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS habit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        occurred_at TEXT DEFAULT CURRENT_TIMESTAMP,
        meta TEXT DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        habit_id INTEGER REFERENCES habits(id) ON DELETE SET NULL,
        task TEXT,
        duration_minutes INTEGER NOT NULL,
        started_at TEXT,
        ended_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        meta TEXT DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        body TEXT,
        read_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        meta TEXT DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS telemetry_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        level TEXT DEFAULT 'info',
        source TEXT DEFAULT 'client',
        details TEXT DEFAULT '{}',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT NOT NULL,
        revoked_at TEXT
      );
    `)
    return
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      meta JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id SERIAL PRIMARY KEY,
      habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      occurred_at TIMESTAMP DEFAULT now(),
      meta JSONB DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      habit_id INTEGER REFERENCES habits(id) ON DELETE SET NULL,
      task TEXT,
      duration_minutes INTEGER NOT NULL,
      started_at TIMESTAMP,
      ended_at TIMESTAMP DEFAULT now(),
      created_at TIMESTAMP DEFAULT now(),
      meta JSONB DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT,
      read_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT now(),
      meta JSONB DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS telemetry_events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      level TEXT DEFAULT 'info',
      source TEXT DEFAULT 'client',
      details JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP
    );
  `)
}

module.exports = { pool, init }
