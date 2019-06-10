'use strict';

const { exec } = require('child_process');
const fs = require('fs');
const ans = JSON.parse(fs.readFileSync('./answers.json'));
const bot = require('./bot');
const {
  getHdl,
  escShellArg,
  sendMsg,
  checkStdout,
  inMono,
  formFlood,
  setOptMsg,
  isAdmin,
  buildCSV,
  change,
  checkStatus,
  getSets
} = require('./functions');

const {
  globSets,
  groupSets,
  userSets
} = require('./collections');

const adminId = parseInt(fs.readFileSync('./data/admin_id', 'utf8'), 10);
const minChars = 1;
const maxChars = 4000;
const minLines = 1;
const maxLines = 200;
const minTimeout = 0.1;
const minTPU = 1;
const statOn = 1;
const statOff = 0;

const cmdList = {
  isEnable: function(msg) {
    this.optMsg = setOptMsg(msg);
    this.type = msg.chat.type;
    this.idChat = msg.chat.id;
    this.params = globSets.get(0);
    this.data = this.type === 'private' ? userSets : groupSets;
    this.localSets = getSets(this.idChat, this.data);
    this.stat = checkStatus(msg, this.params, this.localSets);
    return this.stat === 'enabled';
  },
  init(handler, msg, cmd) {
    if (cmd === '/node') {
      const params = globSets.get(0);
      const maxTPU = params[1];
      handler.inQueue(msg, cmd, maxTPU);
    } else {
      this[cmd](msg);
    }
  },
  '/node': function(msg, handler) {
    if (!this.isEnable(msg)) return;
    const hdl = getHdl(msg);
    const match = msg.text.slice(hdl.length);
    console.log('@' + msg.from.username + ':' + match);
    const code = escShellArg(match);
    const [maxChars, maxLines] = this.localSets;
    const timeout = this.params[0];
    const bashCmd = `echo ${code} | su nodeuser -c 'timeout ${timeout}s node'`;
    const processing = (err, stdout, stderr) => {
      if (err) {
        const timeoutCode = 124;
        if (err.code === timeoutCode) {
          sendMsg(this.idChat, ans.onTimeout, this.optMsg);
        } else {
          const filterFn = line => line.indexOf('Error') === -1 ? 0 : 1;
          const res = stderr.split('\n')
                            .reverse()
                            .filter(filterFn);
          sendMsg(this.idChat, inMono(res[0]), this.optMsg);
        }
      } else {
        const [stat, msg] = checkStdout(stdout, maxLines, maxChars);
        if (stat === 'empty') {
          sendMsg(this.idChat, ans.onEmpty, this.optMsg);
        } else if (stat === 'ok') {
          const res = inMono(msg);
          sendMsg(this.idChat, res, this.optMsg);
        } else {
          const res = inMono(formFlood(msg, maxChars, maxLines)) + ans.onFlood;
          sendMsg(this.idChat, res, this.optMsg);
        }
      }
      handler.queue.shift();
      handler.fromQueue();
    }
    exec(bashCmd, processing);
  },
  '/start': function(msg) {
    if (!this.isEnable(msg)) return;
    sendMsg(msg.chat.id, ans.onStart, this.optMsg);
  },
  '/enable': async function(msg) {
    if (this.isEnable(msg) || this.type === 'private') return;
    const access = await isAdmin(bot, msg);
    if (access) {
      const changeStat = change('stat');
      changeStat(this.idChat, groupSets, this.localSets, statOn);
      sendMsg(this.idChat, ans.onEnable, this.optMsg);
    } else {
      sendMsg(this.idChat, ans.onAccessError, this.optMsg);
    }
  },
  '/disable': async function(msg) {
    if (!this.isEnable(msg) || this.type === 'private') return;
    const access = await isAdmin(bot, msg);
    if (access) {
      const changeStat = change('stat');
      changeStat(this.idChat, groupSets, this.localSets, statOff);
      sendMsg(this.idChat, ans.onDisable, this.optMsg);
    } else {
      sendMsg(this.idChat, ans.onAccessError, this.optMsg);
    }
  },
  '/status': function(msg) {
    this.isEnable(msg);
    const [maxChars, maxLines] = this.localSets;
    const [timeout, maxTPU] = this.params;
    sendMsg(this.idChat, `
  Current status: \`${this.stat.toUpperCase()}\`
  Max characters: \`${maxChars}\`
  Max lines: \`${maxLines}\`
  Time limit: \`${timeout} seconds\`
  Max tasks per user: \`${maxTPU}\``,
    this.optMsg);
  },
  '/globalenable': function(msg) {
    if (this.isEnable(msg)) return;
    if (msg.from.id === adminId) {
      const changeStat = change('stat');
      changeStat(0, globSets, this.params, statOn);
      sendMsg(this.idChat, ans.onGlobalEnable, this.optMsg);
    } else {
      sendMsg(this.idChat, ans.onAccessError, this.optMsg);
    }
  },
  '/globaldisable': function(msg) {
    if (!this.isEnable(msg)) return;
    if (msg.from.id === adminId) {
      const changeStat = change('stat');
      changeStat(0, globSets, this.params, statOff);
      sendMsg(this.idChat, ans.onGlobalDisable, this.optMsg);
    } else {
      sendMsg(this.idChat, ans.onAccessError, this.optMsg);
    }
  },
  '/maxchars': async function(msg) {
    if (!this.isEnable(msg)) return;
    const hdl = getHdl(msg);
    const match = parseInt(msg.text.slice(hdl.length), 10);
    const access = (this.type === 'private' || await isAdmin(bot, msg));
    if (access) {
      if (match >= minChars && match <= maxChars) {
        const changeMaxChars = change('maxChars');
        changeMaxChars(this.idChat, this.data, this.localSets, match);
        sendMsg(this.idChat, ans.onSuccessfully, this.optMsg);
      } else {
        sendMsg(this.idChat, ans.onMaxCharsError, this.optMsg);
      }
    } else {
      sendMsg(this.idChat, ans.onAccessError, this.optMsg);
    }
  },
  '/maxlines': async function(msg) {
    if (!this.isEnable(msg)) return;
    const hdl = getHdl(msg);
    const match = parseInt(msg.text.slice(hdl.length), 10);
    const access = (this.type === 'private' || await isAdmin(bot, msg));
    if (access) {
      if (match >= minLines && match <= maxLines) {
        const changeMaxLines = change('maxLines');
        changeMaxLines(this.idChat, this.data, this.localSets, match);
        sendMsg(this.idChat, ans.onSuccessfully, this.optMsg);
      } else {
        sendMsg(this.idChat, ans.onMaxLinesError, this.optMsg);
      }
    } else {
      sendMsg(this.idChat, ans.onAccessError, this.optMsg);
    }
  },
  '/timeout': function(msg) {
    if (!this.isEnable(msg)) return;
    const hdl = getHdl(msg);
    const match = parseFloat(msg.text.slice(hdl.length));
    if (msg.from.id === adminId) {
      if (match >= minTimeout) {
        const changeTimeout = change('timeout');
        changeTimeout(0, globSets, this.params, match);
        sendMsg(this.idChat, ans.onSuccessfully, this.optMsg);
      } else {
        sendMsg(this.idChat, ans.onTimeoutError, this.optMsg);
      }
    } else {
      sendMsg(this.idChat, ans.onAccessError, this.optMsg);
    }
  },
  '/maxtpu': function(msg) {
    if (!this.isEnable(msg)) return;
    const hdl = getHdl(msg);
    const match = parseInt(msg.text.slice(hdl.length), 10);
    if (msg.from.id === adminId) {
      if (match >= minTPU) {
        const changeMaxTPU = change('maxTPU');
        changeMaxTPU(0, globSets, this.params, match);
        sendMsg(this.idChat, ans.onSuccessfully, this.optMsg);
      } else {
        sendMsg(this.idChat, ans.onMaxTPUError, this.optMsg);
      }
    } else {
      sendMsg(this.idChat, ans.onAccessError, this.optMsg);
    }
  },
  '/update': msg => {
    if (msg.from.id !== adminId) return;
    const optMsg = setOptMsg(msg);
    const user = buildCSV(userSets, 'id,maxChars,maxLines');
    const group = buildCSV(groupSets, 'id,maxChars,maxLines,stat');
    const global = buildCSV(globSets, 'id,timeout,maxTPU,stat');
    const ansUpUser = () => sendMsg(msg.chat.id, ans.onUpUser, optMsg);
    const ansUpGroup = () => sendMsg(msg.chat.id, ans.onUpGroup, optMsg);
    const ansUpGlob = () => sendMsg(msg.chat.id, ans.onUpGlob, optMsg);
    fs.writeFile('./data/user_settings.csv', user, ansUpUser);
    fs.writeFile('./data/group_settings.csv', group, ansUpGroup);
    fs.writeFile('./data/global_settings.csv', global, ansUpGlob);
  }
}

module.exports = { cmdList };
