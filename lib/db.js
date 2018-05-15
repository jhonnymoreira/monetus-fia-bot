const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./db/monetus_fia_bot.db', (err) => {
  if (err) console.error(err.message)
})

// Setup tables
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS subscriptions(chatId text NOT NULL UNIQUE)')
})

// Properly close DB on process stop signal
process.on('SIGINT', () => db.close())

module.exports = db
