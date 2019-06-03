'use strict';

const fs = require('fs');
const answers = JSON.parse(fs.readFileSync('./answers.json'));
const { sendMessage, checkStatus, findSettings, setOptMsg } = require('./functions');
const { onNode, onStart, onStatus, onEnable, onGlobalEnable, onGlobalDisable, onMaxCharsUser, onMaxLinesUser, onDisable, onMaxCharsGroup, onMaxLinesGroup, onTimeout, onMaxTasksPerUser } = require('./commands');
const { defaultSettings, groupSettings, userSettings } = require('./collections');
const bot = require('./bot');

const globalSettings = defaultSettings.global;

const parse = msg => {
  let command;
  if (msg.entities[0].type === 'bot_command' && msg.entities[0].offset === 0) {
    command = msg.text.match(/\/[^ \n@]+/)[0];
    return command;
  }
};

const queue = {
  maxTasksPerUser: globalSettings[2],
  arr: [],
  search(id) {
    console.log(this.maxTasksPerUser);
    const ind = [];
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i][0].from.id === id) {
        ind.push(i);
        if (ind.length === this.maxTasksPerUser) break;
      }
    }
    return ind;
  },
  inQueue(msg) {
    const optionsMsg = setOptMsg(msg);
    const command = parse(msg);
    const status = checkStatus(msg, globalSettings[1], groupSettings[2]);
    if (command === '/status') {
      const sets = findSettings(msg.chat.type, msg.chat.id, groupSettings, userSettings);
      onStatus(msg, status, sets[0], sets[1], globalSettings[0], globalSettings[2]);
    }
    if (status === 'enabled') {
      if (command === '/node') {
        const sets = findSettings(msg.chat.type, msg.chat.id, groupSettings, userSettings);
        console.log(sets);
        const timeout = globalSettings[0];
        const maxChars = sets[0];
        const maxLines = sets[1];
        if (this.arr.length) { //rewrite
          const numbs = this.search(msg.from.id);
          if (numbs.length === this.maxTasksPerUser) {
            const str = answers.onInQueueBefore + numbs.join(', ') + answers.onInQueueAfter;
            sendMessage(msg.chat.id, str, optionsMsg);
          } else {
            this.arr.push([msg, timeout, maxChars, maxLines]);
          }
        } else {
          this.arr.push([msg, timeout, maxChars, maxLines]);
          onNode(msg, this, timeout, maxChars, maxLines);
        }
      } else if (command === '/globaldisable') {
        onGlobalDisable(msg, defaultSettings);
      } else if (command === '/start') {
        onStart(msg);
      } else if (command === '/maxchars') {
        if (msg.chat.type === 'private') onMaxCharsUser(msg, userSettings, defaultSettings);
        else onMaxCharsGroup(msg, groupSettings, defaultSettings, bot);
      } else if (command === '/maxlines') {
        if (msg.chat.type === 'private') onMaxLinesUser(msg, userSettings, defaultSettings);
        else onMaxLinesGroup(msg, groupSettings, defaultSettings);
      } else if (command === '/disable' && msg.chat.type !== 'private') {
        onDisable(msg, groupSettings, bot, defaultSettings);
      } else if (command === '/timeout') {
        onTimeout(msg, defaultSettings);
      } else if (command === '/maxtasksperuser') {
        onMaxTasksPerUser(msg, defaultSettings, this);
      }
    } else if (status === 'locally disabled' && command === '/enable') {
      onEnable(msg, groupSettings, bot, defaultSettings);
    } else if (status === 'globally disabled' && command === '/globalenable') {
      onGlobalEnable(msg, defaultSettings);
    }
  },
  fromQueue() {
    if (this.arr.length) {
      const pars = this.arr[0];
      onNode(pars[0], this, pars[1], pars[2], pars[3]);
    }
  }
};

module.exports = queue;
