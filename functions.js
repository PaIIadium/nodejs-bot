'use strict';

const bot = require('./bot');

function escapeShellArg(match) {
  const reg = /\/\//;
  const res = match.split('\n').map(el => (el.match(reg) ? el.slice(0, el.indexOf('\/\/')) : el)).join(' ');
  return `'${res.replace(/'/g, '\'\\\'\'')}'`;
}

const findHandle = msg => msg.text.match(/\/[^ \n]+/)[0];

const inMono = string => '\`\`\`\n' + string + '\`\`\`';

const formFlood = (lines, maxChars, maxLines) => {
  let count = 0;
  let res = '';
  for (const value of lines) {
    if ((res + value).length - count < maxChars && count < maxLines) {
      res += value + '\n';
      count++;
    } else {
      if (count < maxLines) res += value.slice(0, maxChars - res.length + count);
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

const findSettings = (chatType, chatId, groupSettings, userSettings) => { //rewrite
  if (chatType === ('group' || 'supergroup')) {
    const settings = groupSettings.get(chatId);
    if (settings) {
      return settings;
    } else {
      const def = groupSettings.get(0);
      return def;
    }
  } else {
    const settings = userSettings.get(chatId);
    if (settings) {
      return settings;
    } else {
      const def = userSettings.get(0);
      return def;
    }
  }
};

const checkStatus = (msg, globalStatus, groupStatus) => {
  if (globalStatus) {
    if (msg.chat.type === 'private') return 'enabled';
    else if (groupStatus) return 'enabled';
    else return 'locally disabled';
  } else return 'globally disabled';
};

const changeSet = (type, data, param, value, defSets, id) => {
  if (type === 'user') {
    const set = data.get(id);
    if (param === 'maxLines') {
      if (set) {
        set[1] = value;
      } else {
        const def = [...defSets.user];
        def[1] = value;
        data.set(id, def);
      }
    } else if (param === 'maxChars') {
      if (set) {
        set[0] = value;
      } else {
        const def = [...defSets.user];
        def[0] = value;
        data.set(id, def);
      }
    }
  } else if (type === 'group') {
    const set = data.get(id);
    if (param === 'maxLines') {
      if (set) {
        set[1] = value;
      } else {
        const def = [...defSets.group];
        def[1] = value;
        data.set(id, def);
      }
    } else if (param === 'maxChars') {
      if (set) {
        set[0] = value;
      } else {
        const def = [...defSets.group];
        def[0] = value;
        data.set(id, def);
      }
    } else if (param === 'status') {
      if (set) {
        set[2] = value;
      } else {
        const def = [...defSets.group];
        def[2] = value;
        data.set(id, def);
      }
    }
  } else if (type === 'global') {
    if (param === 'maxTasksPerUser') {
      data.global[2] = value;
    } else if (param === 'timeout') {
      data.global[0] = value;
    } else if (param === 'status') {
      data.global[1] = value;
    }
  }
};

module.exports = { findHandle, escapeShellArg, sendMessage, checkStdout, inMono, formFlood, setOptMsg, parser, findSettings, checkStatus, changeSet };
