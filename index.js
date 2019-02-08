'use strict';

process.env['NTBA_FIX_319'] = 1;

const Bot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const token = process.env.TOKEN;
const bot = new Bot(token, { polling: true });
console.log(token);

const sendMessage = bot.sendMessage.bind(bot);

function escapeShellArg(match) {
  const reg = /\/\//
  const res =	match.input.split('\n').map(el => (el.match(reg) ? el.slice(0, el.indexOf('\/\/')) : el)).join(' ').slice(4);
  
  return `'${res.replace(/'/g, '\'\\\'\'')}'`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const num = {
  '=>': rand(1, 5),
  'for': rand(1, 5),
  'function': rand(1, 5),
  'return': rand(1, 5),
  'class': rand(1, 5),
  'prototype': rand(1, 5),
  'console': rand(1, 5),
  'while': rand(1, 5),
  'log': rand(1, 5),
  'set': rand(1, 5),
  '.': rand(1, 5),
  'use strict': rand(1, 5),
  'const': rand(1, 5),
  'Promise': rand(1, 5),
  'async': rand(1, 5),
  'await': rand(1, 5),
  'require': rand(1, 5),
};

const stick = {
  галстук: 'CAADAgADRAADqEwxBiTzDRtGUkCjAg',
  шапка: 'CAADAgADRgADqEwxBj8KrFytDSVwAg',
  стандарт: 'CAADAgADRwADqEwxBgQ7SDyImeX6Ag',
  здрасте: 'CAADAgADSAADqEwxBrzUqwV-Ukl-Ag',
  вкусняшки: 'CAADAgADSQADqEwxBhCOzsP6pMr1Ag',
  флаг: 'CAADAgADSgADqEwxBhHPQIpIVyVwAg',
  противогаз: 'CAADAgADSwADqEwxBmodgHsXopf-Ag',
  рука: 'CAADAgADTAADqEwxBmVswKMjAVhqAg',
  маска: 'CAADAgADTQADqEwxBjVMC41KQsnBAg',
  оборот: 'CAADAgADTgADqEwxBqfcJ317oGgMAg',
  угомонись: 'CAADAgADLQADG1o7GKSmXmJ3hiSdAg',
  вверх: 'CAADAgADAQADIqDVF2cphv_FuAABBAI',
  совсембольной: 'CAADAgADAgADIqDVF_VrkU5T4epjAg',
  надопку: 'CAADAgADYQAD6adoG7S2tdTg_8cTAg',
};

const arr = Object.keys(num);

function rate(code) {
  let res = 0;
  for (const str of arr) {
    const flag = code.match(new RegExp(str));
    if (flag) res += num[str];
  }
  const ice = ['💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', '💩', ];
  let index = 9;
  for (let i = 0; i < res; i += 10)  ice[index--] = '';
  return ice.join('');
}

function replying(msg, match) {
  const userId = msg.chat.id;
  // sendMessage(userId, '_Тыр пыр, наговнокодили на экспресе, сдали, выбросили, забыли и все счастливы_', { parse_mode: 'Markdown' });
  // bot.sendSticker(msg.chat.id, stick.рука, { reply_to_message_id: msg.message_id })
  console.log('@' + msg.from.username + ': ' + match[1]);
  const code = escapeShellArg(match);
  console.log(code.match(/require('child_process')|require('fs')|process.env.TOKEN/i);
  if (code.match(/require(\'child_process\')|require(\'fs\')|process.env.TOKEN/i)===null) {
    sendMessage(userId,  `Ломай меня иначе`, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
  } else {
    exec(`timeout 1s node -e ${code}`, (error, stdout, stderr) => {
    if (error && error.code) {
      if (error.code == 124) {
        sendMessage(userId,  `Timed out`, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
        // bot.sendSticker(msg.chat.id, stick.совсембольной);
      } else {
        const a = stderr.split('\n').reverse().filter((_) => {
          return _.indexOf('Error') === -1 ? 0 : 1;
        });
        const ind = stderr.split('\n').indexOf(a[0]);
        sendMessage(userId, stderr.split('\n').slice(0, ind + 1).join('\n') + '\`\`\`', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
        // bot.sendSticker(msg.chat.id, stick.здрасте);
      }
    } else {
//       const mark = rate(code);
     	const arr = stdout.split('\n');
     	const characters = arr.join('');
     	const count = characters.length;
     	if (arr.length < 26 && count < 1001) {
     		const res = '\`\`\` ' + arr.join('\n') + '\`\`\`';
     		// bot.sendSticker(msg.chat.id, stick.рука);
     		sendMessage(userId, res + '\n', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id  });
     	}	else if (arr.length >= 26 && count < 1001) {
     			const res = '\`\`\` ' + arr.slice(0, 51).join('\n') + '\`\`\`';
     			// bot.sendSticker(msg.chat.id, stick.рука);
//         + '_Индикатор говнокода:_ ' + mark
       			sendMessage(userId, res + '  _...Флуд_' + '\n' , { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
    	}	else if (arr.length < 26 && count >= 1001) {
    			let res = '';
    			for (const value of arr) {
    				if ((res + value).length < 1001) {
    					res += value + '\n'
    				} else {
    					res += value.slice(1001 - res.length);
    					break;
    				}
    			}
    			if (res) res = '\`\`\` ' + res + '\`\`\`';
    			// bot.sendSticker(msg.chat.id, stick.рука);
    			sendMessage(userId, res + '  _...Флуд_', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
    	}	else if (arr.length >= 26 && count >= 1001) {
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
    			// bot.sendSticker(msg.chat.id, stick.рука);
    			sendMessage(userId, res + '  _...Флуд_', { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
    	}
    }
  });
 }
}

// function sendShems(msg, match) {
//   const res = match.input.split('\n').join('; ');
//   if (res.match(/[эе]кз|сесс?[иі]|зач[ёе]т|сесі|залік|допк/i)) {
//     bot.sendSticker(msg.chat.id, stick.надопку, { reply_to_message_id: msg.message_id });
//   } else if (res.match(/комм?ун[иі]/i)) {
//     bot.sendSticker(msg.chat.id, stick.здрасте, { reply_to_message_id: msg.message_id });
//   } else
//     if (res.match(/Т[іи]ма|метарх/i)) {
//     bot.sendSticker(msg.chat.id, stick.шапка, { reply_to_message_id: msg.message_id });
//   } else if (res.match(/(джс|javascript|прога|js) (дерьмо|говно|лайно|херня)/i)) {
//     bot.sendSticker(msg.chat.id, stick.угомонись, { reply_to_message_id: msg.message_id });
//   } else if (res.match(/кита/i)) {
//     bot.sendSticker(msg.chat.id, stick.флаг, { reply_to_message_id: msg.message_id });
//   } else if (res.match(/говнокод|джс|js|javascript/i)) {
//     bot.sendSticker(msg.chat.id, stick.оборот);
//   } else if (res.match(/оп[іи]л|бухл|алкогол|ковальсь?к|пар[ао]воз|пив|п[іи]нгв[іи]н/i)) {
//     bot.sendMessage(msg.chat.id, '@kowalski0805', { reply_to_message_id: msg.message_id });
//   } else if (res.match(/мачендо|адм[иі]н/i)) {
//     bot.sendMessage(msg.chat.id, '@machendos', { reply_to_message_id: msg.message_id });
//   }
// }

const fn = () => {
  let status = true;
  const delay = (msg, match) => {
    if (status) {
      status = false;
      setTimeout(() => (status = true), 1000);
      replying(msg, match);
    } else {
      setTimeout(delay, 300, msg, match);
    }
  };
  return delay;
};

const delay = fn();

bot.onText(/node (.+)/, delay);

// bot.onText(/(.+)/, sendShems);


bot.onText(/\/start/, msg => sendMessage(msg.chat.id, 'Use "node" to compile your code. For example:' + '\n' + 'node console.log(\'Ave\');' + '\n' + 'setTimeout(() => console.log(\'Marcus Aurelius\'), 500);' + '\n' + 'You have only 900 msc to compile, so use them wisely' + '\n' + 'Rules:'+ '\n' + '1.Insert your code right after the keyword <node>'+ '\n' + '2.Use semicolons!', { parse_mode: 'Markdown' }));
