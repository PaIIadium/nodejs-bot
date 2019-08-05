'use strict';

const bot = require('./bot');
const fs = require('fs');
const adminId = parseInt(fs.readFileSync('/root/bot/nodejs-bot/data/admin_id', 'utf8'), 10);

const escShellArg = match => {
  const reg = /\/\//;
  const res = match.split('\n')
                   .map(el => (el.match(reg) ? 
                     el.slice(0, el.indexOf('\/\/')) : 
                     el)
                    ).join(' ');
  return `'${res.replace(/'/g, '\'\\\'\'')}'`;
}

const getHdl = msg => msg.text.match(/\/[^ \n]+/)[0];

const inMono = str => '\`' + str + '\`';

const formFlood = (lines, maxChars, maxLines) => {
  let count = 0;
  let res = '';
  for (const val of lines) {
    if (count < maxLines) {
      if ((res + val).length - count < maxChars) {
        res += val + '\n';
        count++;
      } else {
        const lengthLast = maxChars - res.length + count
        res += val.slice(0, lengthLast);
        break;
      }
    }
  }
  return res;
};

const checkStdout = (stdout, maxLines, maxChars) => {
  const lines = stdout.split('\n');
  const chars = lines.join('');
  if (lines.length <= maxLines && chars.length <= maxChars) {
    if (chars.length === 0) return ['empty', ''];
    return ['ok', stdout];
  }
  return ['flood', lines];
};

const sendMsg = bot.sendMessage.bind(bot);

const setOptMsg = msg => ({
  parse_mode: 'Markdown',
  reply_to_message_id: msg.message_id
});

const getCmd = msg => {
  let cmd;
  const type = msg.entities[0].type;
  const offset = msg.entities[0].offset;
  if (type === 'bot_command' && offset === 0) {
    cmd = msg.text.match(/\/[^ \n@]+/)[0];
    return cmd;
  }
};

const buildMap = (file, defSets) => {
  const res = new Map();
  res.set(0, defSets);
  const lines = file.split('\n');
  lines.shift();
  lines.pop();
  const dataset = lines.map(line => line.split(',')
                                        .map(val => +val)
                            );
  for (const record of dataset) {
    const id = record[0];
    const data = record.slice(1);
    res.set(id, data);
  }
  return res;
};

const getSets = (id, data) => {
  const sets = data.get(id);
  if (sets) return sets;
  const defSets = data.get(0);
  return defSets;
};

const checkStatus = (msg, params, localSets) => {
  const globStat = params[2];
  if (globStat) {
    if (msg.chat.type === 'private') {
      return 'enabled';
    }
    const groupStat = localSets[2];
    if (groupStat) {
      return 'enabled';
    }
    return 'locally disabled';
  }
  return 'globally disabled';
};

const conformity = {
  maxChars: 0,
  maxLines: 1,
  stat: 2,
  timeout: 0,
  maxTPU: 1 // max tasks per user
}

const change = prop => (id, data, sets, val) => {
  const index = conformity[prop];
  const newSets = [...sets];
  newSets[index] = val;
  data.set(id, newSets);
}

const isAdmin = async (bot, msg) => {
  if (msg.from.id === adminId) return true;
  const chatMember = await bot.getChatMember(msg.chat.id, msg.from.id);
  const post = chatMember.status;
  if (post === 'creator' || post === 'administrator') return true;
  return false;
}

const buildCSV = (map, title) => {
  let res = title + '\n';
  const keys = map.keys();
  for (const id of keys) {
    const arr = [...map.get(id)];
    arr.unshift(id);
    const str = arr.join(',') + '\n';
    res += str;
  }
  return res;
}

module.exports = { 
  getHdl, 
  escShellArg,
  sendMsg,
  checkStdout,
  inMono,
  formFlood,
  setOptMsg,
  buildMap,
  getSets,
  checkStatus,
  isAdmin,
  getCmd,
  buildCSV,
  change
};
