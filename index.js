'use strict';

process.env['NTBA_FIX_319'] = 1;

const Bot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const token = '724668528:AAE4fo6fQ9_VV-6Lvrh4DfMnOyhhpA4_UfQ';
const bot = new Bot(token, { polling: true });

const sendMessage = bot.sendMessage.bind(bot);

function escapeShellArg(match) {
  const reg = /\/\//;
  const res = (match.input.slice(4)).split('\n').map(el => (el.match(reg) ? el.slice(0, el.indexOf('\/\/')) : el)).join(' ');
  return `'${res.replace(/'/g, '\'\\\'\'')}'`;
}

function replying(msg, match) {
  const userId = msg.chat.id;
  console.log('@' + msg.from.username + ': ' + match[1]);
  const code = escapeShellArg(match);
  exec(`su nodeuser -c 'timeout 1.3s node -e ${code}'`, (error, stdout, stderr) => {
    if (error && error.code) {
      if (error.code === 124) {
        sendMessage(userId, '_Timed out_', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
      } else {
        const a = stderr.split('\n').reverse().filter((_) => _.indexOf('Error') === -1 ? 0 : 1);
        sendMessage(userId, '\`\`\` '  + a[0] + '\`\`\`', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
      }
    } else {
      const arr = stdout.split('\n');
      const characters = arr.join('');
      const count = characters.length;
      if (arr.length < 26 && count < 1001) {
        const res = '\`\`\` ' + arr.join('\n') + '\`\`\`';
        sendMessage(userId, res + '\n', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id  });
      } else if (arr.length >= 26 && count < 1001) {
        const res = '\`\`\` ' + arr.slice(0, 51).join('\n') + '\`\`\`';
        sendMessage(userId, res + '  _...Флуд_' + '\n', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
      } else if (arr.length < 26 && count >= 1001) {
        let res = '';
        for (const value of arr) {
          if ((res + value).length < 1001) {
            res += value + '\n';
          } else {
            res += value.slice(1001 - res.length);
            break;
          }
        }
        if (res) res = '\`\`\` ' + res + '\`\`\`';
        sendMessage(userId, res + '  _...Флуд_', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
      } else if (arr.length >= 26 && count >= 1001) {
        const sliceArr = arr.slice(0, 25);
        let res = '';
        if (sliceArr.join('').length > 1001) {
          for (const value of sliceArr) {
            if ((res + value).length < 1001) {
              res += value + '\n';
            } else {
              res += value.slice(1001 - res.length);
              break;
            }
          }
        } else {
          res = sliceArr.join('\n');
        }
        res = '\`\`\` ' + res + '\`\`\`';
        console.log('z1');
        sendMessage(userId, res + '  _...Флуд_', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
      }
    }
  });
}

const fn = () => {
  let status = true;
  const delay = (msg, match) => {
    if (status) {
      status = false;
      setTimeout(() => (status = true), 1300);
      replying(msg, match);
    } else {
      setTimeout(delay, 300, msg, match);
    }
  };
  return delay;
};

const delay = fn();

bot.onText(/node (.+)/, delay);

bot.onText(/\/start/, msg => sendMessage(msg.chat.id, 'Use "node" to compile your code. For example:' + '\n' + 'node console.log(\'Ave\');' + '\n' + 'setTimeout(() => console.log(\'Marcus Aurelius\'), 500);' + '\n' + 'You have only 900 msc to compile, so use them wisely' + '\n' + 'Rules:' + '\n' + '1.Insert your code right after the keyword <node>' + '\n' + '2.Use semicolons!', { parse_mode: 'Markdown' }));
