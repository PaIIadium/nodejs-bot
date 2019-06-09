'use strict';

process.env['NTBA_FIX_319'] = 1;

const bot = require('./bot');
const handler = require('./handler');

bot.on('text', handler.onMessage.bind(handler));
