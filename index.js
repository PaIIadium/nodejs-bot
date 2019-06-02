'use strict';

process.env['NTBA_FIX_319'] = 1;

const bot = require('./bot');
const queue = require('./queue');

bot.on('text', queue.inQueue.bind(queue));
