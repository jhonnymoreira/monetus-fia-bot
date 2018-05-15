const portfolio = require('./portfolio')
const messages = require('./messages')
const { parseCommand, throttle } = require('./utils')

const {
  addSubscription,
  removeSubscription,
  isSubscribed
} = require('./subscriptions')

function start () {
  return messages.start()
}

function help () {
  return messages.help()
}

function composition () {
  return messages.composition(portfolio.composition)
}

function details (message) {
  const ticker = parseCommand(message.text).args
  const asset = portfolio.getAsset(ticker)

  if (!asset) return messages.assetNotFound(ticker)

  return messages.details(asset)
}

function quote (message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message)
    if (throttled) return resolve(messages.throttle(throttled))

    const ticker = parseCommand(message.text).args
    const asset = portfolio.getAsset(ticker)

    if (!asset) return resolve(messages.assetNotFound(ticker))

    portfolio.fetchQuote(asset.ticker).then(quote => {
      resolve(messages.quote(asset, quote))
    }).catch(reject)
  })
}

function performance (message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message, true)
    if (throttled) return resolve(messages.throttle(throttled))

    portfolio.fetchPerformance().then(perf => {
      resolve(messages.performance(perf))
    }).catch(reject)
  })
}

function detailedPerformance (message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message, true)
    if (throttled) return resolve(messages.throttle(throttled))

    portfolio.fetchPerformance().then(perf => {
      resolve(messages.detailedPerformance(perf))
    }).catch(reject)
  })
}

function subscribe (message) {
  const chatId = message.chat.id

  return new Promise((resolve, reject) => {
    isSubscribed(chatId).then((subscribed) => {
      if (subscribed) {
        resolve(messages.alreadySubscribed())
      } else {
        addSubscription(chatId).then(() => {
          resolve(messages.subscribed())
        }).catch(reject)
      }
    }).catch(reject)
  })
}

function unsubscribe (message) {
  const chatId = message.chat.id

  return new Promise((resolve, reject) => {
    isSubscribed(chatId).then((subscribed) => {
      if (subscribed) {
        removeSubscription(chatId).then(() => {
          resolve(messages.unsubscribed())
        }).catch(reject)
      } else {
        resolve(messages.notSubscribed())
      }
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
  detailedPerformance,
  subscribe,
  unsubscribe
}
