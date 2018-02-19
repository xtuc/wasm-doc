#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');
const {readFileSync} = require('fs');

const printText = require('./printers/text');
const printMarkdown = require('./printers/markdown');

function out(msg) {
  process.stdout.write(msg + '\n');
}

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

program
  .version(pkg.version)
  .usage('[options] <file>')
  .option('-o, --out [type]', 'Output format', 'text')
  .parse(process.argv);

const [filename] = program.args;
const buff = toArrayBuffer(readFileSync(filename, null));

switch (program.out) {
  case 'text':
    out(printText(buff));
    break;

  case 'md':
  case 'markdown':
    out(printMarkdown(buff));
    break;

  default:
    throw new Error('Unsupported output: ' + program.out);
}
