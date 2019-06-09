'use strict';

const { exec } = require('child_process');
const fs = require('fs');
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
  change
} = require('./functions');

const ans = JSON.parse(fs.readFileSync('./answers.json'));
const adminId = parseInt(fs.readFileSync('./data/admin_id', 'utf8'), 10);
const minChars = 1;
const maxChars = 4000;
const minLines = 1;
const maxLines = 200;
const minTimeout = 0.1;
const minTPU = 1;
const statOn = 1;
const statOff = 0;

const onNode = (msg, handler, timeout, maxChars, maxLines) => {
  const optMsg = setOptMsg(msg);
  const hdl = getHdl(msg);
  const match = msg.text.slice(hdl.length);
  const id = msg.chat.id;
  console.log('@' + msg.from.username + ':' + match);
  const code = escShellArg(match);
  const bashCmd = `echo ${code} | su nodeuser -c 'timeout ${timeout}s node'`;
  const processing = (err, stdout, stderr) => {
    if (err) {
      const timeoutCode = 124;
      if (err.code === timeoutCode) {
        sendMsg(id, ans.onTimeout, optMsg);
      } else {
        const filterFn = line => line.indexOf('Error') === -1 ? 0 : 1;
        const res = stderr.split('\n')
                          .reverse()
                          .filter(filterFn);
        sendMsg(id, inMono(res[0]), optMsg);
      }
    } else {
      const [stat, msg] = checkStdout(stdout, maxLines, maxChars);
      if (stat === 'empty') {
        sendMsg(id, ans.onEmpty, optMsg);
      } else if (stat === 'ok') {
        const res = inMono(msg);
        sendMsg(id, res, optMsg);
      } else {
        const res = inMono(formFlood(msg, maxChars, maxLines)) + ans.onFlood;
        sendMsg(id, res, optMsg);
      }
    }
    handler.queue.shift();
    handler.fromQueue();
  }
  exec(bashCmd, processing);
}

const onStart = msg => {
  const optMsg = setOptMsg(msg);
  sendMsg(msg.chat.id, ans.onStart, optMsg);
}

const onEnable = async (msg, groupSets, localSets, bot) => {
  const optMsg = setOptMsg(msg);
  const access = await isAdmin(bot, msg);
  if (access) {
    const changeStat = change('stat');
    changeStat(msg.chat.id, groupSets, localSets, statOn);
    sendMsg(msg.chat.id, ans.onEnable, optMsg);
  } else {
    sendMsg(msg.chat.id, ans.onAccessError, optMsg);
  }
}

const onDisable = async (msg, groupSets, localSets, bot) => {
  const optMsg = setOptMsg(msg);
  const access = await isAdmin(bot, msg);
  if (access) {
    const changeStat = change('stat');
    changeStat(msg.chat.id, groupSets, localSets, statOff);
    sendMsg(msg.chat.id, ans.onDisable, optMsg);
  } else {
    sendMsg(msg.chat.id, ans.onAccessError, optMsg);
  }
}

const onStatus = (msg, localSets, params, stat) => {
  const idChat = msg.chat.id;
  const [maxChars, maxLines] = localSets;
  const [timeout, maxTPU] = params;
  const optMsg = setOptMsg(msg);
  sendMsg(idChat, `
Current status: \`${stat.toUpperCase()}\`
Max characters: \`${maxChars}\`
Max lines: \`${maxLines}\`
Time limit: \`${timeout} seconds\`
Max tasks per user: \`${maxTPU}\``,
  optMsg);
}

const onGlobalEnable = (msg, globSets, params) => {
  const optMsg = setOptMsg(msg);
  if (msg.from.id === adminId) {
    const changeStat = change('stat');
    changeStat(0, globSets, params, statOn);
    sendMsg(msg.chat.id, ans.onGlobalEnable, optMsg);
  } else {
    sendMsg(msg.chat.id, ans.onAccessError, optMsg);
  }
}

const onGlobalDisable = (msg, globSets, params) => {
  const optMsg = setOptMsg(msg);
  if (msg.from.id === adminId) {
    const changeStat = change('stat');
    changeStat(0, globSets, params, statOff);
    sendMsg(msg.chat.id, ans.onGlobalDisable, optMsg);
  } else {
    sendMsg(msg.chat.id, ans.onAccessError, optMsg);
  }
}

const onMaxCharsGroup = async (msg, groupSets, localSets, bot) => {
  const optMsg = setOptMsg(msg);
  const hdl = getHdl(msg);
  const match = parseInt(msg.text.slice(hdl.length), 10);
  const access = await isAdmin(bot, msg);
  if (access) {
    if (match >= minChars && match <= maxChars) {
      const changeMaxChars = change('maxChars');
      changeMaxChars(msg.chat.id, groupSets, localSets, match);
      sendMsg(msg.chat.id, ans.onSuccessfully, optMsg);
    } else {
      sendMsg(msg.chat.id, ans.onMaxCharsError, optMsg);
    }
  } else {
    sendMsg(msg.chat.id, ans.onAccessError, optMsg);
  }
}

const onMaxCharsUser = (msg, userSets, localSets) => {
  const optMsg = setOptMsg(msg);
  const hdl = getHdl(msg);
  const match = parseInt(msg.text.slice(hdl.length), 10);
  if (match >= minChars && match <= maxChars) {
    const changeMaxChars = change('maxChars');
    changeMaxChars(msg.chat.id, userSets, localSets, match);
    sendMsg(msg.chat.id, ans.onSuccessfully, optMsg);
  } else {
    sendMsg(msg.chat.id, ans.onMaxCharsError, optMsg);
  }
}

const onMaxLinesGroup = async (msg, groupSets, localSets, bot) => {
  const optMsg = setOptMsg(msg);
  const hdl = getHdl(msg);
  const match = parseInt(msg.text.slice(hdl.length), 10);
  const access = await isAdmin(bot, msg);
  if (access) {
    if (match >= minLines && match <= maxLines) {
      const changeMaxLines = change('maxLines');
      changeMaxLines(msg.chat.id, groupSets, localSets, match);
      sendMsg(msg.chat.id, ans.onSuccessfully, optMsg);
    } else {
      sendMsg(msg.chat.id, ans.onMaxLinesError, optMsg);
    }
  } else {
    sendMsg(msg.chat.id, ans.onAccessError, optMsg);
  }
}

const onMaxLinesUser = (msg, userSets, localSets) => {
  const optMsg = setOptMsg(msg);
  const hdl = getHdl(msg);
  const match = parseInt(msg.text.slice(hdl.length), 10);
  if (match >= minLines && match <= maxLines) {
    const changeMaxLines = change('maxLines');
    changeMaxLines(msg.chat.id, userSets, localSets, match);
    sendMsg(msg.chat.id, ans.onSuccessfully, optMsg);
  } else {
    sendMsg(msg.chat.id, ans.onMaxLinesError, optMsg);
  }
}

const onTimeout = (msg, globSets, params) => {
  const optMsg = setOptMsg(msg);
  const hdl = getHdl(msg);
  const match = parseFloat(msg.text.slice(hdl.length));
  if (msg.from.id === adminId) {
    if (match >= minTimeout) {
      const changeTimeout = change('timeout');
      changeTimeout(0, globSets, params, match);
      sendMsg(msg.chat.id, ans.onSuccessfully, optMsg);
    } else {
      sendMsg(msg.chat.id, ans.onTimeoutError, optMsg);
    }
  } else {
    sendMsg(msg.chat.id, ans.onAccessError, optMsg);
  }
}

const onMaxTPU = (msg, globSets, params) => {
  const optMsg = setOptMsg(msg);
  const hdl = getHdl(msg);
  const match = parseInt(msg.text.slice(hdl.length), 10);
  if (msg.from.id === adminId) {
    if (match >= minTPU) {
      const changeMaxTPU = change('maxTPU');
      changeMaxTPU(0, globSets, params, match);
      sendMsg(msg.chat.id, ans.onSuccessfully, optMsg);
    } else {
      sendMsg(msg.chat.id, ans.onMaxTPUError, optMsg);
    }
  } else {
    sendMsg(msg.chat.id, ans.onAccessError, optMsg);
  }
}

const onUpdate = (msg, userSets, groupSets, globSets) => {
  if (msg.from.id === adminId) {
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

module.exports = { 
  onNode, 
  onStart, 
  onEnable, 
  onStatus, 
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
};
