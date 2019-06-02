'use strict';

const fs = require('fs');
const group_settings = fs.readFileSync('./group_settings.csv', 'utf8');

const groupParse = str => {
    const res = new Map();
    const lines = str.split('\n');
    for (const line of lines) {
      const arr = line.split(',');
      res.set(arr[0], arr.slice(1, -1));
    }
    return res;
  };

console.log(groupParse(group_settings));
