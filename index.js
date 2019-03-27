// Imports
const WebSocket = require('ws');
const fs = require('fs')

// Init webdocket
const ws = new WebSocket('wss://irc-ws.chat.twitch.tv')

// When connection is opened
ws.on('open', function open() {
  // Load the config and read the options
  fs.readFile('./config.json', 'utf8', (err, data) => {
    if (err) throw err
    ws.send('PASS ' + JSON.parse(data).pass)
    ws.send('NICK ' + JSON.parse(data).user)
    ws.send('JOIN ' + JSON.parse(data).channel)
  })
})

ws.on('message', function incoming(data) {

  data_clean = data.replace(/(\r\n|\r|\n)/g, "").trim()

  // Reply to PINGs
  if (data_clean === 'PING :tmi.twitch.tv') {
    ws.send('PONG :tmi.twitch.tv')
    console.log('Replied to a ping')
  }

  // If channel message
  if (data_clean.indexOf('PRIVMSG') > -1) {
    user = data_clean.match(/\:.+?\!/g)[0]
    user = user.replace(':', '').replace('!', '')
    message = data_clean.substring(data_clean.indexOf("PRIVMSG")).match(/:.+/g)[0].replace(':', '')

    if(message.indexOf('!') <= 0) {
      fs.readFile('./config.json', 'utf8', (err, json) => {
        if (err) throw err
        var i
        for (i = 0; i < JSON.parse(json).commands.length; i++){
          if (JSON.parse(json).commands[i].cmd === message.split(" ")[0]) {
            console.log(user + ' Ran command ' + JSON.parse(json).commands[i].cmd)
            ws.send('PRIVMSG ' + JSON.parse(json).channel + ' :' + JSON.parse(json).commands[i].resp)
          }
        }
      })
    }
  }
})
