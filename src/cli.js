#!/usr/bin/env node

const {readFileSync} = require('fs');

const printDoc = require('./index');

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

const filename = process.argv[2];
const buff = toArrayBuffer(readFileSync(filename, null));

console.log(printDoc(buff));
