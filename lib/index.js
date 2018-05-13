const { Composer, log, session } = require('micro-bot')
const commands = require('./commands')

const bot = new Composer()

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
    .catch(replyWithMarkdown)
)

// Performance
bot.command('p', ({ replyWithMarkdown, message }) =>
  commands.performance(message)
    .then(replyWithMarkdown)
    .catch(replyWithMarkdown)
)

// Detailed Performance
bot.command('pd', ({ replyWithMarkdown, message }) =>
  commands.detailedPerformance(message)
    .then(replyWithMarkdown)
    .catch(replyWithMarkdown)
)

module.exports = bot
