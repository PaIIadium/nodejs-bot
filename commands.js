'use strict';

const { exec } = require('child_process');
const fs = require('fs');
const { findHandle, escapeShellArg, sendMessage, checkStdout, inMono, formFlood, setOptMsg, changeSet, isAdmin } = require('./functions');
const answers = JSON.parse(fs.readFileSync('./answers.json'));
const adminId = +fs.readFileSync('./admins_id', 'utf8').trim();

function onNode(msg, queue, timeout, maxChars, maxLines) {
  const optionsMsg = setOptMsg(msg);
  const handle = findHandle(msg);
  const match = msg.text.slice(handle.length);
  const chatId = msg.chat.id;
  console.log('@' + msg.from.username + ':' + match);
  const code = escapeShellArg(match);
  exec(`echo ${code} | su nodeuser - c 'timeout ${timeout}s node'`, (error, stdout, stderr) => {
    if (error && error.code) {
      if (error.code === 124) {
        sendMessage(chatId, answers.onTimeout, optionsMsg);
      } else {
        const a = stderr.split('\n').reverse().filter((_) => (_.indexOf('Error') === -1 ? 0 : 1));
        sendMessage(chatId, inMono(a[0]), optionsMsg);
      }
    } else {
      const msgStat = checkStdout(stdout, maxLines, maxChars);
      if (msgStat[0] === 'empty') {
        sendMessage(chatId, answers.onEmpty, optionsMsg);
      } else if (msgStat[0] === 'ok') {
        const res = inMono(msgStat[1]);
        sendMessage(chatId, res, optionsMsg);
      } else {
        const res = formFlood(msgStat[1], maxChars, maxLines) + answers.onFlood;
        sendMessage(chatId, res, optionsMsg);
      }
    }
    queue.arr.shift();
    queue.fromQueue();
  });
}

function onStart(msg) {
  const optionsMsg = setOptMsg(msg);
  sendMessage(msg.chat.id, answers.onStart, optionsMsg);
}

async function onEnable(msg, groupSettings, bot, defaultSettings) {
  const optionsMsg = setOptMsg(msg);
  const status = await isAdmin(bot, msg);
  if (status) {
    changeSet('group', groupSettings, 'status', true, defaultSettings, msg.chat.id);
    sendMessage(msg.chat.id, answers.onEnable, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onAccessError, optionsMsg);
}

async function onDisable(msg, groupSettings, bot, defaultSettings) {
  const optionsMsg = setOptMsg(msg);
  const status = await isAdmin(bot, msg);
  if (status) {
    changeSet('group', groupSettings, 'status', false, defaultSettings, msg.chat.id);
    sendMessage(msg.chat.id, answers.onDisable, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onAccessError, optionsMsg);
}

function onStatus(msg, status, maxChars, maxLines, timeout, maxInQueue) {
  const optionsMsg = setOptMsg(msg);
  sendMessage(msg.chat.id, `
Current status: \`${status.toUpperCase()}\`
Max characters: \`${maxChars}\`
Max lines: \`${maxLines}\`
Time limit: \`${timeout} seconds\`
Max tasks per user: \`${maxInQueue}\``,
  optionsMsg);
}

function onGlobalEnable(msg, defaultSettings) {
  const optionsMsg = setOptMsg(msg);
  if (msg.from.id === adminId) {
    changeSet('global', defaultSettings, 'status', true);
    sendMessage(msg.chat.id, answers.onGlobalEnable, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onAccessError, optionsMsg);
}

function onGlobalDisable(msg, defaultSettings) {
  const optionsMsg = setOptMsg(msg);
  if (msg.from.id === adminId) {
    changeSet('global', defaultSettings, 'status', false);
    sendMessage(msg.chat.id, answers.onGlobalDisable, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onAccessError, optionsMsg);
}

async function onMaxCharsGroup(msg, groupSettings, defaultSettings, bot) {
  const optionsMsg = setOptMsg(msg);
  const handle = findHandle(msg);
  const match = +msg.text.slice(handle.length);
  const status = await isAdmin(bot, msg);
  if (status) {
    if (match % 1 === 0 && match > 0 && match < 5001) {
      changeSet('group', groupSettings, 'maxChars', match, defaultSettings, msg.chat.id);
      sendMessage(msg.chat.id, answers.onSuccessfully, optionsMsg);
    } else sendMessage(msg.chat.id, answers.onMaxCharsError, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onAccessError, optionsMsg);
}

function onMaxCharsUser(msg, userSettings, defaultSettings) {
  const optionsMsg = setOptMsg(msg);
  const handle = findHandle(msg);
  const match = +msg.text.slice(handle.length);
  if (match % 1 === 0 && match > 0 && match < 5001) {
    changeSet('user', userSettings, 'maxChars', match, defaultSettings, msg.chat.id);
    sendMessage(msg.chat.id, answers.onSuccessfully, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onMaxCharsError, optionsMsg);
}

async function onMaxLinesGroup(msg, groupSettings, defaultSettings, bot) {
  const optionsMsg = setOptMsg(msg);
  const handle = findHandle(msg);
  const match = +msg.text.slice(handle.length);
  const status = await isAdmin(bot, msg);
  if (status) {
    if (match % 1 === 0 && match > 0 && match < 101) {
      changeSet('group', groupSettings, 'maxLines', match, defaultSettings, msg.chat.id);
      sendMessage(msg.chat.id, answers.onSuccessfully, optionsMsg);
    } else sendMessage(msg.chat.id, answers.onMaxLinesError, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onAccessError, optionsMsg);
}

function onMaxLinesUser(msg, userSettings, defaultSettings) {
  const optionsMsg = setOptMsg(msg);
  const handle = findHandle(msg);
  const match = +msg.text.slice(handle.length);
  if (match % 1 === 0 && match > 0 && match < 101) {
    changeSet('user', userSettings, 'maxLines', match, defaultSettings, msg.chat.id);
    sendMessage(msg.chat.id, answers.onSuccessfully, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onMaxLinesError, optionsMsg);
}

function onTimeout(msg, defaultSettings) {
  const optionsMsg = setOptMsg(msg);
  const handle = findHandle(msg);
  const match = +msg.text.slice(handle.length);
  if (msg.from.id === adminId) {
    if (match > 0) {
      changeSet('global', defaultSettings, 'timeout', match);
      sendMessage(msg.chat.id, answers.onSuccessfully, optionsMsg);
    } else sendMessage(msg.chat.id, answers.onTimeoutError, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onAccessError, optionsMsg);
}

function onMaxTasksPerUser(msg, defaultSettings, queue) {
  const optionsMsg = setOptMsg(msg);
  const handle = findHandle(msg);
  const match = +msg.text.slice(handle.length);
  if (msg.from.id === adminId) {
    if (match % 1 === 0 && match > 0) {
      changeSet('global', defaultSettings, 'maxTasksPerUser', match);
      queue.maxTasksPerUser = match;
      sendMessage(msg.chat.id, answers.onSuccessfully, optionsMsg);
    } else sendMessage(msg.chat.id, answers.onMaxTasksPerUserError, optionsMsg);
  } else sendMessage(msg.chat.id, answers.onAccessError, optionsMsg);
}

module.exports = { onNode, onStart, onEnable, onStatus, onGlobalEnable, onGlobalDisable, onMaxCharsUser, onMaxLinesUser, onDisable, onMaxCharsGroup, onMaxLinesGroup, onTimeout, onMaxTasksPerUser };
