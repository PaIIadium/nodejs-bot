'use strict';

const fs = require('fs');
const answers = JSON.parse(fs.readFileSync('./answers.json'));
const { sendMessage, findSettings } = require('./functions');
const { onNode, onStart, onStatus } = require('./commands');
const { globalSettings, groupSettings, userSettings } = require('./collections');

const commandList = new Map([
  ['/node', onNode],
  ['/start', onStart],
  //['/status', onStatus]
]);

const parse = msg => {
  let command;
  if (msg.entities[0].type === 'bot_command' && msg.entities[0].offset === 0) {
    command = msg.text.match(/\/[^ \n@]+/)[0];
    if (commandList.has(command)) return command;
  }
};

const queue = {
  maxTasksPerUser: globalSettings[2],
  arr: [],
  search(id) {
    const ind = [];
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i].from.id === id) {
        ind.push(i);
        if (ind.length === this.maxTasksPerUser) break;
      }
    }
    return ind;
  },
  inQueue(msg) {
    const optionsMsg = {
      parse_mode: 'Markdown',
      reply_to_message_id: msg.message_id
    };
    const command = parse(msg);
    if (command === '/node') {
      const settings = findSettings(msg.chat.type, msg.chat.id, groupSettings, userSettings);
      console.log(settings);
      if (this.arr.length) {
        const numbs = this.search(msg.from.id);
        if (numbs.length === this.maxTasksPerUser) {
          const str = answers.onInQueueBefore + numbs.join(', ') + answers.onInQueueAfter;
          sendMessage(msg.chat.id, str, optionsMsg);
        } else {
          this.arr.push(msg);
        }
      } else {
        this.arr.push(msg);
        commandList.get('/node')(msg, this, settings, globalSettings[0]);
      }
    } else if (command) commandList.get(command)(msg);
  },
  fromQueue() {
    if (this.arr.length) {
      const msg = this.arr[0];
      const settings = findSettings(msg.chat.type, msg.chat.id, groupSettings, userSettings);
      commandList.get('/node')(msg, this, settings, globalSettings[0]);
    }
  }
};

module.exports = queue;
