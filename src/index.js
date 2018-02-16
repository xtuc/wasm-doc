const {parsers} = require("webassembly-interpreter/lib/tools");

const {print} = require('./printer');

module.exports = function(buff) {
  const ast = parsers.parseWASM(buff);
  return print(ast);
};
