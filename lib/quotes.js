const YahooFinanceAPI = require('yahoo-finance-data')
const { round } = require('./utils')

const yahoo = new YahooFinanceAPI({
  key: process.env.YAHOO_KEY,
  secret: process.env.YAHOO_SECRET
})

function fetchQuote (ticker) {
  return new Promise((resolve, reject) => {
    yahoo
      .getHistoricalData(`${ticker}.SA`, '1d', '1d')
      .then(data => {
        const quote = data.chart.result[0].indicators.quote[0]
        const previousClose = data.chart.result[0].meta.chartPreviousClose

        let q = {
          ticker: ticker,
          previousClose: round(previousClose),
          open: round(quote.open),
          high: round(quote.high),
          close: round(quote.close),
          low: round(quote.low),
          volume: round(quote.volume[0])
        }

        q.delta = round((q.close - q.previousClose) / q.previousClose * 100)

        resolve(q)
      }).catch(err => {
        console.log(err)
        reject(new Error('Serviço temporariamente fora do ar, por favor, tente mais tarde.'))
      })
  })
}

function fetchQuotes (tickers) {
  return Promise.all(tickers.map(fetchQuote))
}

module.exports = { fetchQuote, fetchQuotes }
