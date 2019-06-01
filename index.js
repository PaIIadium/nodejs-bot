'use strict';

process.env['NTBA_FIX_319'] = 1;

const Bot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const token = fs.readFileSync('./tg_token', 'utf8').trim();
const bot = new Bot(token, { polling: true });
const sendMessage = bot.sendMessage.bind(bot);

function escapeShellArg(match) {
  const reg = /\/\//;
  const res = match.split('\n').map(el => (el.match(reg) ? el.slice(0, el.indexOf('\/\/')) : el)).join(' ');
  return `'${res.replace(/'/g, '\'\\\'\'')}'`;
}

function replying(msg) {
  if (msg.entities[0].type === 'bot_command' && msg.entities[0].offset === 0) {
    const command = msg.text.match(/\/[^ ]+/)[0];
    console.log(command);
    if (command === '/node@kompilatorBot') {
      const match = msg.text.slice(command.length);
      const userId = msg.chat.id; 
      console.log('@' + msg.from.username + ':' + match);
      const code = escapeShellArg(match);
      exec(`echo ${code} | timeout 1.5s node`, (error, stdout, stderr) => {
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
            if (count === 0) {
              sendMessage(userId, '_This code does not log anything_', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id  });
            } else {
              const res = '\`\`\` ' + arr.join('\n') + '\`\`\`';
              sendMessage(userId, res + '\n', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id  });
            }
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
            sendMessage(userId, res + '  _...Флуд_', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
          }
        }
      });
    } else if (command === '/start@kompilatorBot') {
      sendMessage(msg.chat.id, 'Use "node" to compile your code. For example:' + '\n' + 'node console.log(\'Ave\');' + '\n' + 'setTimeout(() => console.log(\'Marcus Aurelius\'), 500);' + '\n' + 'You have only 900 msc to compile, so use them wisely' + '\n' + 'Rules:' + '\n' + '1.Insert your code right after the keyword <node>' + '\n' + '2.Use semicolons!', { parse_mode: 'Markdown' });
    }
  }
}

const fn = () => {
  let status = true;
  const delay = msg => {
    if (status) {
      status = false;
      setTimeout(() => (status = true), 1500);
      replying(msg);
    } else {
      setTimeout(delay, 300, msg);
    }
  };
  return delay;
};

const delay = fn();

bot.on('text', delay);
