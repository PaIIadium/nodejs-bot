'use strict';
const TelegramBot = require('node-telegram-bot-api');

const { exec } = require('child_process');

const token = '796127956:AAGBAY5LWVMU4JtnVWs878tlaT8i6_bF4Fw';

const bot = new TelegramBot(token, { polling: true });

function rate(code) {
  if (!code) return 0;
  return Math.floor((Math.random() * 60) + 40);
}

function repl(arg) {
  return `'${arg.replace(/'/g, '\'\\\'\'')}'`;
}

bot.onText(/node (.+)/, (msg, match) => {
  const fromId = msg.chat.id;
  setTimeout(() => {
    bot.sendMessage(fromId, 'Показывайте код...');
  }, 0);
  const code = match.input.split('\n').join(' ').slice(4);
  const fcode = repl(code);
  const rating = rate(code);
  exec(`node -e ${fcode}`, { timeout: 1000 }, (error, stdout, stderr) => {
    if (stdout) {
      bot.sendMessage(fromId, stdout);
      if (!stderr) {
        setTimeout(() => {
          bot.sendMessage(fromId, 'Поставлю вам...' + '\n' + rating);
        }, 500);
      }
    }
    if (stderr) {
      bot.sendMessage(fromId, 'Поздравляю, вы попали на допку ', stderr);
    }

  });

});
