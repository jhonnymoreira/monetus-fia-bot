require('dotenv').config()

const { Composer, log, session } = require('micro-bot')
const portfolio = require('./portfolio')

const bot = new Composer()

bot.use(log())
bot.use(session())

bot.start(({ reply }) => reply('Olá, bem-vindo ao Monetus FIA Tracker!'))
bot.help(({ replyWithMarkdown }) => replyWithMarkdown(`
  *Comandos*

  /c - Retorna a composição atual do Monetus FIA.
  /d [ticker] - Retorna detalhes como alocação, nome e descrição do ativo.
  /q [ticker] - Retorna a cotação do ativo.
  /p - Retorna a performance do dia do Monetus FIA.
  /pd - Retorna a performance detalhada do dia do Monetus FIA.
`))

function formatDelta(delta) {
  if (delta > 0) {
    return `+${delta}%`
  } else {
    return `${delta}%`
  }
}

let previousTime = 0
function throttle(reply) {
  const time = Date.now()
  const timeAgo = time - previousTime
  const min = 300000 // 5 minutes in milliseconds

  if (timeAgo < min) {
    const left = Math.round((min - timeAgo) / 60000 * 100) / 100
    reply(`Comando executado recentemente, por favor aguarde ${left} minutos e tente novamente.`)
    return true
  } else {
    previousTime = time
    return false
  }
}

// Composition
bot.command('c', ({ replyWithMarkdown }) => {
  let comp = '';

  portfolio.composition.forEach((asset) => (
    comp += `
*${asset.ticker} (${asset.name})*
_Alocação_: ${asset.allocation/100}%
    `
  ))

  replyWithMarkdown(`
    *Composição do Monetus FIA*
    ${comp}
  `)
})

// Details
bot.command('d', ({ replyWithMarkdown, message: { text } }) => {
  const ticker = text.slice(2).trim()
  const asset = portfolio.getAsset(ticker)

  if (!asset) {
    return replyWithMarkdown(`Ativo "${ticker}" não encontrado no portfólio.`)
  }

  replyWithMarkdown(`
    *${asset.ticker} (${asset.name})*

_Alocação_: ${asset.allocation/100}%

_Descrição_: ${asset.description}
  `)
})

// Quote
bot.command('q', ({ replyWithMarkdown, message: { text } }) => {
  if (throttle(replyWithMarkdown)) return

  const ticker = text.slice(2).trim()
  const asset = portfolio.getAsset(ticker)

  if (!asset) {
    return replyWithMarkdown(`Ativo "${ticker}" não encontrado no portfólio.`)
  }

  portfolio.fetchQuote(asset.ticker).then((quote) => {
    replyWithMarkdown(`
      *${asset.ticker} (${asset.name})*

\`\`\`
Delta:  ${formatDelta(quote.delta)}
Prev.:  ${quote.previousClose}
Open:   ${quote.open}
High:   ${quote.high}
Close:  ${quote.close}
Low:    ${quote.low}
Volume: ${quote.volume}
\`\`\`
    `)
  }).catch((err) => replyWithMarkdown(err))
})

// Performance
bot.command('p', ({ replyWithMarkdown }) => {
  if (throttle(replyWithMarkdown)) return

  portfolio.fetchPerformance().then((performance) => {
    replyWithMarkdown(`*Performance do portfólio*: ${formatDelta(performance.delta)}`)
  }).catch((err) => replyWithMarkdown(err))
})

// Detailed Performance
bot.command('pd', ({ replyWithMarkdown }) => {
  if (throttle(replyWithMarkdown)) return

  portfolio.fetchPerformance().then((performance) => {
    let comp = '';

    performance.assets.forEach((asset) => (
      comp += `
  *${asset.ticker} (${asset.name})*
  _Alocação_: ${asset.allocation/100}%
  _Delta_: ${formatDelta(asset.quote.delta)}
      `
    ))

    replyWithMarkdown(`
      *Performance do Monetus FIA*
      ${comp}

      *Portfólio*: ${formatDelta(performance.delta)}
    `)
  }).catch((err) => replyWithMarkdown(err))
})

module.exports = bot
