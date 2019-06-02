'use strict';

const fs = require('fs');
const defaultSettings = JSON.parse(fs.readFileSync('./default_settings.json'));
const { parser } = require('./functions');
const groupFile = fs.readFileSync('./group_settings.csv', 'utf8');
const userFile = fs.readFileSync('./user_settings.csv', 'utf8');

const groupSettings = parser(groupFile, defaultSettings.group);
const userSettings = parser(userFile, defaultSettings.user);
const globalSettings = defaultSettings.global;

module.exports = { groupSettings, userSettings, globalSettings };



