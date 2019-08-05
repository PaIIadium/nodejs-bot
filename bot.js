'use strict';

const Bot = require('node-telegram-bot-api');
const fs = require('fs');
const token = fs.readFileSync('./data/tg_token', 'utf8').trim();
const bot = new Bot(token, { polling: true });

module.exports = bot;
