const { Composer, log, session } = require('micro-bot')
const { apiError, unexpectedError } = require('./messages')
const { scheduleNotifications } = require('./notifications')
const commands = require('./commands')

const bot = new Composer()

bot.initialize = ({ telegram }) => scheduleNotifications(telegram)

bot.use(log())
bot.use(session())

bot.start(({ reply }) => reply(commands.start()))

bot.help(({ replyWithMarkdown }) => replyWithMarkdown(commands.help()))

// Composition
bot.command('c', ({ replyWithMarkdown }) =>
  replyWithMarkdown(commands.composition())
)

// Details
bot.command('d', ({ replyWithMarkdown, message }) =>
  replyWithMarkdown(commands.details(message))
)

// Quote
bot.command('q', ({ replyWithMarkdown, message }) =>
  commands.quote(message)
    .then(replyWithMarkdown)
    .catch(() => replyWithMarkdown(apiError()))
)

// Performance
bot.command('p', ({ replyWithMarkdown, message }) =>
  commands.performance(message)
    .then(replyWithMarkdown)
    .catch(() => replyWithMarkdown(apiError()))
)

// Detailed Performance
bot.command('pd', ({ replyWithMarkdown, message }) =>
  commands.detailedPerformance(message)
    .then(replyWithMarkdown)
    .catch(() => replyWithMarkdown(apiError()))
)

// Subscribe to daily notifications
bot.command('subscribe', ({ replyWithMarkdown, message }) =>
  commands.subscribe(message)
    .then(replyWithMarkdown)
    .catch(() => replyWithMarkdown(unexpectedError()))
)

// Unsubscribe from daily notifications
bot.command('unsubscribe', ({ replyWithMarkdown, message }) =>
  commands.unsubscribe(message)
    .then(replyWithMarkdown)
    .catch(() => replyWithMarkdown(unexpectedError()))
)

module.exports = bot
