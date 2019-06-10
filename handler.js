'use strict';

const { getCmd, sendMsg, setOptMsg } = require('./functions');
const ans = require('./answers.json');
const { cmdList } = require('./commands');

const handler = {
  queue: [],
  inQueue(msg, cmd, maxTPU) {
    const arr = this.search(msg.from.id);
    if (arr.length < maxTPU) {
      this.queue.push([msg, cmd]);
      if (this.queue.length === 1) this.fromQueue();
    } else {
      const optMsg = setOptMsg(msg);
      const str = ans.onInQueueBefore + arr + ans.onInQueueAfter;
      sendMsg(msg.chat.id, str, optMsg);
    }
  },
  search(id) {
    const reducer = (acc, value, i) =>
      (value[0].from.id === id ? [...acc, i] : acc);
    const res = this.queue.reduce(reducer, []);
    return res;
  },
  onMessage(msg) {
    const cmd = getCmd(msg);
    cmdList.init(this, msg, cmd);
  },
  fromQueue() {
    if (this.queue.length) {
      const [msg, cmd] = this.queue[0];
      cmdList[cmd](msg, this);
    }
  }
};

module.exports = handler;
