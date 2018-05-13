const portfolio = require('./portfolio')

const {
  parseCommand,
  formatDelta,
  assetNotFound,
  throttle
} = require('./utils')

function start () {
  return 'Olá, bem-vindo ao Monetus FIA Tracker!'
}

function help () {
  return (`
*Comandos*

/c - Retorna a composição atual do Monetus FIA.
/d [ticker] - Retorna detalhes como alocação, nome e descrição do ativo.
/q [ticker] - Retorna a cotação do ativo.
/p - Retorna a performance do dia do Monetus FIA.
/pd - Retorna a performance detalhada do dia do Monetus FIA.
  `)
}

function composition () {
  let comp = ''

  portfolio.composition.forEach((asset) => (
    comp += `
*${asset.ticker} (${asset.name}):* ${asset.allocation / 100}%
    `
  ))

  return (`
*Composição do Monetus FIA*
${comp}
  `)
}

function details (message) {
  const ticker = parseCommand(message.text).args
  const asset = portfolio.getAsset(ticker)

  if (!asset) return assetNotFound(ticker)

  return (`
*${asset.ticker} (${asset.name})*

_Alocação_: ${asset.allocation / 100}%

_Descrição_: ${asset.description}
  `)
}

function quote (message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message)
    if (throttled) resolve(throttled)

    const ticker = parseCommand(message.text).args
    const asset = portfolio.getAsset(ticker)

    if (!asset) resolve(assetNotFound(ticker))

    portfolio.fetchQuote(asset.ticker).then(quote => {
      resolve(`
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
    }).catch(reject)
  })
}

function performance (message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message, true)
    if (throttled) resolve(throttled)

    portfolio.fetchPerformance().then(performance => {
      resolve(`*Performance da carteira*: ${formatDelta(performance.delta)}`)
    }).catch(reject)
  })
}

function detailedPerformance (message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message, true)
    if (throttled) resolve(throttled)

    portfolio.fetchPerformance().then(performance => {
      let comp = ''

      performance.assets.forEach(asset => (
        comp += `
*${asset.ticker} (${asset.name})*
_Alocação_: ${asset.allocation / 100}%
_Delta_: ${formatDelta(asset.quote.delta)}
        `
      ))

      resolve(`
*Performance do Monetus FIA*
${comp}

*Portfólio*: ${formatDelta(performance.delta)}
      `)
    }).catch(reject)
  })
}

module.exports = {
  start,
  help,
  composition,
  details,
  quote,
  performance,
  detailedPerformance
}
