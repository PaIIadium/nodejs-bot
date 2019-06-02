'use strict';

const bot = require('./bot');

function escapeShellArg(match) {
  const reg = /\/\//;
  const res = match.split('\n').map(el => (el.match(reg) ? el.slice(0, el.indexOf('\/\/')) : el)).join(' ');
  return `'${res.replace(/'/g, '\'\\\'\'')}'`;
}

const findHandle = msg => msg.text.match(/\/[^ \n]+/)[0];

const inMono = string => '\`\`\`\n' + string + '\`\`\`';

const formFlood = lines => {
  let count = 0;
  let res = '';
  for (const value of lines) {
    if ((res + value).length - count < 1000 && count < 25) {
      res += value + '\n';
      count++;
    } else {
      if (count < 25) res += value.slice(0, 1000 - res.length + count);
      break;
    }
  }
  return inMono(res);
};

const checkStdout = (stdout, maxLines, maxChars) => {
  const lines = stdout.split('\n');
  const chars = lines.join('');
  if (lines.length <= maxLines && chars.length <= maxChars) {
    if (chars.length === 0) return ['empty'];
    else return ['ok', stdout];
  } else return ['flood', lines];
};

const sendMessage = bot.sendMessage.bind(bot);

const setOptMsg = msg => ({
  parse_mode: 'Markdown',
  reply_to_message_id: msg.message_id
});

const parser = (str, def) => {
  const res = new Map();
  res.set(0, def);
  const lines = str.split('\n');
  for (const line of lines) {
    const arr = line.split(',');
    res.set(arr[0], arr.slice(1, -1));
  }
  return res;
};

const findSettings = (chatType, chatId, groupSettings, userSettings) => {
  if (chatType === ('group' || 'supergroup')) {
    const settings = groupSettings.get(chatId);
    if (settings) {
      return settings;
    } else {
      const def = groupSettings.get(0);
      groupSettings.set(chatId, def);
      return def;
    }
  } else {
    const settings = groupSettings.get(chatId);
    if (settings) {
      return settings;
    } else {
      const def = userSettings.get(0);
      userSettings.set(chatId, def);
      return def;
    }
  }
}

module.exports = { findHandle, escapeShellArg, sendMessage, checkStdout, inMono, formFlood, setOptMsg, parser, findSettings };
