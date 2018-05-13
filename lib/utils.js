function formatDelta (delta) {
  if (delta > 0) {
    return `+${delta}%`
  } else {
    return `${delta}%`
  }
}

function parseCommand (text) {
  const parts = text.split(' ')

  const command = parts[0].toLowerCase().trim()

  let args = ''
  if (parts[1]) args = parts[1].toString().toUpperCase().trim()

  return { command, args }
}

function assetNotFound (ticker) {
  return `Ativo "${ticker}" não encontrado no portfólio.`
}

function formatTimeLeft (seconds) {
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 3600 % 60)

  return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2)
}

let lastCommands = {}
const min = 300000 // 5 minutes in milliseconds

function throttle (message, ignoreArgs) {
  const c = parseCommand(message.text)

  let k = message.chat.id.toString() + c.command
  if (!ignoreArgs) k += c.args

  const last = lastCommands[k]
  const time = Date.now()

  if (last) {
    const timeAgo = time - last

    if (timeAgo < min) {
      const left = formatTimeLeft((min - timeAgo) / 1000)
      return `Comando executado recentemente, por favor, aguarde ${left} minutos e tente novamente.`
    }
  }

  lastCommands[k] = time
  return false
}

function round (num) {
  return Math.round(parseFloat(num) * 100) / 100
}

module.exports = {
  formatDelta,
  parseCommand,
  assetNotFound,
  throttle,
  round
}
