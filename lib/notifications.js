const schedule = require('node-schedule')
const chunk = require('lodash.chunk')

const { getAllSubscribed } = require('./subscriptions')
const { fetchPerformance } = require('./portfolio')
const { normalHoursPerformance, afterMarketPerformance } = require('./messages')

// About the hours: https://goo.gl/LbUqxz
function scheduleNotifications (telegram) {
  const workDays = new schedule.Range(1, 5) // Mon-Fri

  let normalHours = new schedule.RecurrenceRule()
  normalHours.dayOfWeek = workDays
  normalHours.hour = 17
  normalHours.minute = 5 // Delay 5 min to make sure Yahoo has close data

  schedule.scheduleJob(normalHours, function () {
    broadcastNotifications(telegram, normalHoursPerformance)
  })

  let afterMarketHours = new schedule.RecurrenceRule()
  afterMarketHours.dayOfWeek = workDays
  afterMarketHours.hour = 18
  afterMarketHours.minute = 5

  schedule.scheduleJob(afterMarketHours, function () {
    broadcastNotifications(telegram, afterMarketPerformance)
  })
}

function broadcastNotifications (telegram, messageBuilder) {
  fetchPerformance().then(performance => {
    const message = messageBuilder(performance)

    getAllSubscribed().then(chatIds => {
      chunk(chatIds, 30).forEach((ids, i) => { // Telegram limits to 30 msg/s
        ((i, ids) => { // Wait 1.5 seconds between each chunk
          setTimeout(() => { // This makes me hate JS so much
            ids.forEach(id => {
              telegram.sendMessage(id, message, { parse_mode: 'Markdown' })
            })
          }, 1500 * i)
        })(i, ids)
      })
    }).catch(err => console.error(err))
  }).catch(err => console.error(err))
}

module.exports = {
  scheduleNotifications
}
