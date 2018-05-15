const db = require('./db')

function addSubscription (chatId) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        'INSERT INTO subscriptions(chatId) VALUES(?)', [chatId.toString()],
        function (err) {
          if (err) return reject(err)
          resolve(this.lastID)
        }
      )
    })
  })
}

function removeSubscription (chatId) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        'DELETE FROM subscriptions WHERE chatId = ?', [chatId.toString()],
        function (err) {
          if (err) return reject(err)
          resolve(this.changes)
        }
      )
    })
  })
}

function isSubscribed (chatId) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        'SELECT chatId FROM subscriptions WHERE chatId = ?', [chatId.toString()],
        function (err, row) {
          if (err) return reject(err)
          resolve(row)
        }
      )
    })
  })
}

function getAllSubscribed () {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all(
        'SELECT chatId FROM subscriptions', [],
        function (err, rows) {
          if (err) return reject(err)
          resolve(rows.map(row => row.chatId))
        }
      )
    })
  })
}

module.exports = {
  addSubscription,
  removeSubscription,
  isSubscribed,
  getAllSubscribed
}
