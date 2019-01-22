'use strict';

process.env['NTBA_FIX_319'] = 1;

const Bot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.send('it is running\n');
}).listen(process.env.PORT || 5000);

const bot = new Bot('796127956:AAGBAY5LWVMU4JtnVWs878tlaT8i6_bF4Fw', { polling: true });
const sendMessage = bot.sendMessage.bind(bot);

function escapeShellArg(arg) {
  return `'${arg.replace(/'/g, '\'\\\'\'')}'`;
}

function rate(code) {
  if (!code) return 0;
  return Math.floor((Math.random() * 40) + 60);
}

function replying(msg, match) {
  const userId = msg.chat.id;
  sendMessage(userId, 'Блин, опять в этом говне разбираться...');
  console.log('@' + msg.from.username + ': ' + match[1]);
  const fcode = match.input.split('\n').join(' ').slice(4);
  const code = escapeShellArg(fcode);
  exec(`timeout 1s node -e ${code}`, { }, (error, stdout, stderr) => {
    if (error && error.code === 1) sendMessage(userId, 'Паяльник мне в процессор...Что он написал?\n' + stderr);
    else if (!stdout) sendMessage(userId, 'Мне лень это считать, застрелитесь');
    else {
      const arr = stdout.split('\n');
      const count = arr.join('');
      if (arr.length < 102 && count.length < 1001) sendMessage(userId, 'С ума сойти, оно даже скомпилировалось...\n' + arr.join('   |   ').slice(0, -4));
      else sendMessage(userId, 'Флуд не пройдёт!');
    }
  });
  const rating = rate(code);
  sendMessage(userId, `Вы получаете ${rating}`);
}
bot.onText(/node (.+)/, replying);
