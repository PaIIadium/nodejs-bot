'use strict';

process.env['NTBA_FIX_319'] = 1;

const bot = require('/root/bot/bot');
const handler = require('/root/bot/handler');

bot.on('text', handler.onMessage.bind(handler));
