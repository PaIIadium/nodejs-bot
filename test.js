'use strict';

function unparser(map) {
  let res = '';
  const keys = map.keys();
  for (const id of keys) {
    res += id + ',';
    const data = map.get(id);
    for (const value of data) {
      res += value + ',';
    }
    res += '\n';
  }
  return res;
}

const map = new Map();

map.set(12345, [123, true, 122, 543]);
map.set(3232, [3453, false, 456, 999]);

console.log(unparser(map));
