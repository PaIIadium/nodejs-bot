'use strict';

const Bot = require('node-telegram-bot-api');
const fs = require('fs');
const token = fs.readFileSync('./data/tg_token', 'utf8').trim();
const bot = new Bot('740329558:AAEk51962AJ7fvURcYNbhr15upqXcye6Gk0', { polling: true });

module.exports = bot;
