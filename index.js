'use strict';

process.env['NTBA_FIX_319'] = 1;

const Bot = require('node-telegram-bot-api');
const { exec } = require('child_process');

const bot = new Bot('724668528:AAGugqpjdQzAHXTHfrdm0W3Cqz7VgyJXBn0', { polling: true });

const sendMessage = bot.sendMessage.bind(bot);

function escapeShellArg(match) {
  const res =	match.input.split('\n').join(' ').slice(4);
  return `'${res.replace(/'/g, '\'\\\'\'')}'`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const num = {
  '=>': rand(5, 10),
  'for': rand(5, 10),
  'function': rand(5, 10),
  'return': rand(5, 10),
  'class': rand(5, 10),
  'prototype': rand(5, 10),
  'console': rand(20, 40),
  'while': rand(5, 10),
  'log': rand(5, 10),
  'set': rand(5, 10),
  '.': rand(5, 10),
  'use strict': rand(5, 10)
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
  let index = 0;
  for (let i = 0; i < res; i += 10)  ice[index++] = '🍦';
  return ice.join('');
}

function replying(msg, match) {
  const userId = msg.chat.id;
  sendMessage(userId, '_Тыр пыр, наговнокодили на экспресе, сдали, выбросили, забыли и все счастливы_', { parse_mode: 'Markdown' });
  // bot.sendSticker(msg.chat.id, stick.рука, { reply_to_message_id: msg.message_id })
  console.log('@' + msg.from.username + ': ' + match[1]);
  const code = escapeShellArg(match);
  exec(`timeout 1s node -e ${code}`, (error, stdout, stderr) => {
    if (error && error.code) {
      if (error.code == 124) {
        sendMessage(userId,  `_Ты правда думаешь, что я буду это вычислять,_ @${msg.from.username}_?_`, { parse_mode: 'Markdown' });
        // bot.sendSticker(msg.chat.id, stick.совсембольной);
      } else {
        sendMessage(userId, `_Что здесь происходит?.. Что_ @${msg.from.username} _написал?_\n\n` + '\`\`\`' + stderr.slice(0, stderr.indexOf('at')) + '\`\`\`', { parse_mode: 'Markdown' });
        // bot.sendSticker(msg.chat.id, stick.здрасте);
      }
    } else {
      const mark = rate(code);
     	const arr = stdout.split('\n');
     	const characters = arr.join('');
     	const count = characters.length;
     	if (arr.length < 52 && count < 1001) {
     		const res = '\`\`\` ' + arr.join('   |   ').slice(0, -4) + '\`\`\`';
     		// bot.sendSticker(msg.chat.id, stick.рука);
     		sendMessage(userId, `_С ума сойти, оно даже скомпилировалось,_ @${msg.from.username}_,_ \n` + res + '\n' + '_Оценка:_ ' + mark, { parse_mode: 'Markdown' });
     	}	else if (arr.length >= 52 && count < 1001) {
     			const res = '\`\`\` ' + arr.slice(0, 51).join('   |   ').slice(0, -4) + '\`\`\`';
     			// bot.sendSticker(msg.chat.id, stick.рука);
       			sendMessage(userId, `_С ума сойти, оно даже скомпилировалось,_ @${msg.from.username}_,_ \n` + res + '  _...Флуд_' + '\n' + '_Оценка:_ ' + mark, { parse_mode: 'Markdown' });
    	}	else if (arr.length < 52 && count >= 1001) {
    			let res = '';
    			for (const value of arr) {
    				if ((res + value).length < 1001) {
    					res += value + '   |   ';
    				} else {
    					res += value.slice(999 - res.length);
    					break;
    				}
    			}
    			if (res) res = '\`\`\` ' + res.slice(0, -4) + '\`\`\`';
    			// bot.sendSticker(msg.chat.id, stick.рука);
    			sendMessage(userId, `_С ума сойти, оно даже скомпилировалось,_ @${msg.from.username}_,_ \n` + res + '  _...Флуд_', { parse_mode: 'Markdown' });
    	}	else if (arr.length >= 52 && count >= 1001) {
    			const sliceArr = arr.slice(0, 51);
    			let res = '';
    			if (sliceArr.join('').length > 1001) {
    				for (const value of sliceArr) {
    					if ((res + value).length < 1001) {
    						res += value + '   |   ';
    					} else {
    						res += value.slice(999 - res.length);
    						break;
    					}
    				}
    			} else {
    				res = sliceArr.join('   |   ');
    			}
    			res = '\`\`\` ' + res.slice(0, -4) + '\`\`\`';
    			// bot.sendSticker(msg.chat.id, stick.рука);
    			sendMessage(userId, `_С ума сойти, оно даже скомпилировалось,_ @${msg.from.username}_,_ \n` + res + '  _...Флуд_', { parse_mode: 'Markdown' });
    	}
    }
  });
}

function sendShems(msg, match) {
  const res = match.input.split('\n').join('; ');
  if (res.match(/экз|сесси|зач[ёе]т/i)) {
    bot.sendSticker(msg.chat.id, stick.стандарт, { reply_to_message_id: msg.message_id });
  } else if (res.match(/допк/i)) {
    bot.sendSticker(msg.chat.id, stick.здрасте, { reply_to_message_id: msg.message_id });
  } else if (res.match(/шемс|Т[іи]ма|метарх|т[іи]мур/i)) {
    bot.sendSticker(msg.chat.id, stick.шапка, { reply_to_message_id: msg.message_id });
  } else if (res.match(/(джс|javascript|прога|js) (дерьмо|говно|лайно|херня)/i)) {
    bot.sendSticker(msg.chat.id, stick.угомонись, { reply_to_message_id: msg.message_id });
  } else if (res.match(/к[іи]та|коммун[іи]|комун[іи]/i)) {
    bot.sendSticker(msg.chat.id, stick.флаг, { reply_to_message_id: msg.message_id });
  } else if (res.match(/код|джс|js|javascript/i)) {
    bot.sendSticker(msg.chat.id, stick.оборот, { reply_to_message_id: msg.message_id });
  } else if (res.match(/оп[іи]л|бухл|алкогол|ковальськ|паровоз|ілл|пив|п[іи]нгв[іи]н/i)) {
    bot.sendMessage(msg.chat.id, '@kowalski0805');
  } else if (res.match(/мачендо|н[іи]к[іи]т/i)) {
    bot.sendMessage(msg.chat.id, '@kowalski0805');
  }
}

bot.onText(/node (.+)/, replying);

bot.onText(/(.+)/, sendShems);
