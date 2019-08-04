'use strict';

const fs = require('fs');
const defSets = JSON.parse(fs.readFileSync('/root/bot/nodejs-bot/data/def_settings.json'));
const { buildMap } = require('/root/bot/nodejs-bot/functions');
const groupFile = fs.readFileSync('/root/bot/nodejs-bot/data/group_settings.csv', 'utf8');
const userFile = fs.readFileSync('/root/bot/nodejs-bot/data/user_settings.csv', 'utf8');
const globalFile = fs.readFileSync('/root/bot/nodejs-bot/data/global_settings.csv', 'utf8');

const groupSets = buildMap(groupFile, defSets.group);
const userSets = buildMap(userFile, defSets.user);
const globSets = buildMap(globalFile, defSets.global);

module.exports = { groupSets, userSets, globSets };
