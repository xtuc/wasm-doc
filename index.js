#!/usr/bin/env node

const {readFileSync} = require('fs');
const {parsers} = require("webassembly-interpreter/lib/tools");

const {print} = require('./printer');

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

const filename = process.argv[2];

const buff = toArrayBuffer(readFileSync(filename, null));
const ast = parsers.parseWASM(buff);

console.log(print(ast));
