const { formatDelta, formatTimeLeft } = require('./utils')

function start () {
  return 'Olá, bem-vindo ao Monetus FIA Tracker! Envie /help para ver a lista de comandos.'
}

function help () {
  return (`
*Comandos*

/c - Retorna a composição atual do Monetus FIA.
/d [ticker] - Retorna detalhes como alocação, nome e descrição do ativo.
/q [ticker] - Retorna a cotação do ativo.
/p - Retorna a performance do dia do Monetus FIA.
/pd - Retorna a performance detalhada do dia do Monetus FIA.
/subscribe - Increver-se para receber notificações diárias.
/unsubscribe - Parar de receber notificações diárias.
  `)
}

function composition (assets) {
  let comp = ''

  assets.forEach((asset) => (
    comp += `
*${asset.ticker} (${asset.name}):* ${asset.allocation / 100}%
    `
  ))

  return (`
*Composição do Monetus FIA*
${comp}
  `)
}

function details (asset) {
  return (`
*${asset.ticker} (${asset.name})*

_Alocação_: ${asset.allocation / 100}%

_Descrição_: ${asset.description}
  `)
}

function quote (asset, quote) {
  return (`
*${asset.ticker} (${asset.name})*

\`\`\`
Variação:   ${formatDelta(quote.delta)}
Anterior:   ${quote.previousClose}
Abertura:   ${quote.open}
Alta:       ${quote.high}
Fechamento: ${quote.close}
Baixa:      ${quote.low}
Volume:     ${quote.volume}
\`\`\`
  `)
}

function performance (perf) {
  return `*Performance da carteira*: ${formatDelta(perf.delta)}`
}

function detailedPerformance (perf) {
  let comp = ''

  perf.assets.forEach(asset => (
    comp += `
*${asset.ticker} (${asset.name})*
_Alocação_: ${asset.allocation / 100}%
_Variação_: ${formatDelta(asset.quote.delta)}
    `
  ))

  return (`
*Performance do Monetus FIA*
${comp}

*Carteira*: ${formatDelta(perf.delta)}
  `)
}

function normalHoursPerformance (perf) {
  return `*Mercado fechado!*\n` + detailedPerformance(perf)
}

function afterMarketPerformance (perf) {
  return `*After-Market fechado!*\n` + detailedPerformance(perf)
}

function alreadySubscribed () {
  return 'Você já está inscrito para receber notificações.'
}

function subscribed () {
  return 'Inscrito com sucesso! Você receberá notificações diárias.'
}

function unsubscribed () {
  return 'Inscrição removida com sucesso! Você não receberá mais notificações diárias.'
}

function notSubscribed () {
  return 'Você não está inscrito para receber notificações.'
}

function throttle (left) {
  return `Comando executado recentemente, por favor, aguarde ${formatTimeLeft(left)} minutos e tente novamente.`
}

function assetNotFound (ticker) {
  return `Ativo "${ticker}" não encontrado na carteira.`
}

function apiError () {
  return 'Comando indisponível no momento, por favor, tente novamente mais tarde.'
}

function unexpectedError () {
  return 'Ocorreu um erro inesperado, por favor, comunique @zavan.'
}

module.exports = {
  start,
  help,
  composition,
  details,
  quote,
  performance,
  detailedPerformance,
  normalHoursPerformance,
  afterMarketPerformance,
  throttle,
  alreadySubscribed,
  subscribed,
  unsubscribed,
  notSubscribed,
  assetNotFound,
  apiError,
  unexpectedError
}
