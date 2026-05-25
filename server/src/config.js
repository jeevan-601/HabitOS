const JWT_SECRET = process.env.JWT_SECRET || 'habitos-local-dev-secret'
const DATABASE_URL = process.env.DATABASE_URL || ''
const USE_SQLITE = !DATABASE_URL

module.exports = { JWT_SECRET, DATABASE_URL, USE_SQLITE }
