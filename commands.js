'use strict';

const { exec } = require('child_process');
const fs = require('fs');
const { findHandle, escapeShellArg, sendMessage, checkStdout, inMono, formFlood, setOptMsg } = require('./functions');
const answers = JSON.parse(fs.readFileSync('./answers.json'));

function onNode(msg, queue, settings, timeout) {
  const optionsMsg = setOptMsg(msg);
  const handle = findHandle(msg);
  const match = msg.text.slice(handle.length);
  const chatId = msg.chat.id;
  console.log('@' + msg.from.username + ':' + match);
  const code = escapeShellArg(match);
  exec(`echo ${code} | su nodeuser -c 'timeout ${timeout}s node'`, (error, stdout, stderr) => {
    if (error && error.code) {
      if (error.code === 124) {
        sendMessage(chatId, answers.onTimeout, optionsMsg);
      } else {
        const a = stderr.split('\n').reverse().filter((_) => (_.indexOf('Error') === -1 ? 0 : 1));
        sendMessage(chatId, inMono(a[0]), optionsMsg);
      }
    } else {
      const maxChars = settings[0];
      const maxLines = settings[1];
      const msgStat = checkStdout(stdout, maxLines, maxChars);
      if (msgStat[0] === 'empty') {
        sendMessage(chatId, answers.onEmpty, optionsMsg);
      } else if (msgStat[0] === 'ok') {
        const res = inMono(msgStat[1]);
        sendMessage(chatId, res, optionsMsg);
      } else {
        const res = formFlood(msgStat[1]) + answers.onFlood;
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

// function onStatus(msg) {
//   const optionsMsg = setOptMsg(msg);
//   const s
// }

module.exports = { onNode, onStart };
