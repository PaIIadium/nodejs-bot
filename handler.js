'use strict';

const fs = require('fs');
const answers = JSON.parse(fs.readFileSync('./answers.json'));
const {
  sendMsg,
  checkStatus,
  getSets,
  setOptMsg,
  getCmd
} = require('./functions');

const {
  onNode,
  onStart,
  onStatus,
  onEnable,
  onGlobalEnable,
  onGlobalDisable,
  onMaxCharsUser,
  onMaxLinesUser,
  onDisable,
  onMaxCharsGroup,
  onMaxLinesGroup,
  onTimeout,
  onMaxTPU,
  onUpdate
} = require('./commands');

const {
  globSets,
  groupSets,
  userSets
} = require('./collections');

const bot = require('./bot');

const handler = {
  queue: [],
  search(id) {
    const reducer = (acc, value, i) =>
      (value[0].from.id === id ? [...acc, i] : acc);
    return this.queue.reduce(reducer, []);
  },
  onMessage(msg) {
    const optMsg = setOptMsg(msg);
    const cmd = getCmd(msg);
    const type = msg.chat.type;
    const idChat = msg.chat.id;
    const params = globSets.get(0);
    const [timeout, maxTPU] = params;
    if (cmd === '/update') {
      onUpdate(msg, userSets, groupSets, globSets);
      return;
    }
    const data = type === 'private' ? userSets : groupSets;
    const localSets = getSets(idChat, data);
    const stat = checkStatus(msg, params, localSets);
    if (cmd === '/status') {
      onStatus(msg, localSets, params, stat);
      return;
    }
    if (stat === 'enabled') {
      if (cmd === '/node') {
        const numbs = this.search(msg.from.id);
        if (numbs.length === maxTPU) {
          numbs.join(',');
          const str = answers.onInQueueBefore + numbs + answers.onInQueueAfter;
          sendMsg(idChat, str, optMsg);
        } else {
          const [maxChars, maxLines] = localSets;
          this.queue.push([msg, timeout, maxChars, maxLines]);
          if (this.queue.length === 1) {
            onNode(msg, this, timeout, maxChars, maxLines);
          }
        }
      } else if (cmd === '/globaldisable') {
        onGlobalDisable(msg, globSets, params);
      } else if (cmd === '/start') {
        onStart(msg);
      } else if (cmd === '/maxchars') {
        type === 'private' ? onMaxCharsUser(msg, userSets, localSets) :
          onMaxCharsGroup(msg, groupSets, localSets, bot);
      } else if (cmd === '/maxlines') {
        type === 'private' ? onMaxLinesUser(msg, userSets, localSets) :
          onMaxLinesGroup(msg, groupSets, localSets, bot);
      } else if (cmd === '/disable' && type !== 'private') {
        onDisable(msg, groupSets, localSets, bot);
      } else if (cmd === '/timeout') {
        onTimeout(msg, globSets, params);
      } else if (cmd === '/maxtpu') {
        onMaxTPU(msg, globSets, params);
      }
    } else if (stat === 'locally disabled' && cmd === '/enable') {
      onEnable(msg, groupSets, localSets, bot);
    } else if (stat === 'globally disabled' && cmd === '/globalenable') {
      onGlobalEnable(msg, globSets, params);
    }
  },
  fromQueue() {
    if (this.queue.length) {
      const [msg, timeout, maxChars, maxLines] = this.queue[0];
      onNode(msg, this, timeout, maxChars, maxLines);
    }
  }
};

module.exports = handler;
