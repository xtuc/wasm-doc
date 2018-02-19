const {parsers} = require("webassembly-interpreter/lib/tools");

const printText = require('./printers/text');
const printMarkdown = require('./printers/markdown');
const printJavaScript = require('./printers/javascript');

module.exports = function(buff, {out, url}) {
  const ast = parsers.parseWASM(buff);

  switch (out) {
    case 'text': return printText(ast);

    case 'md':
    case 'markdown':
      return printMarkdown(ast);

    case 'js':
    case 'javascript':
      return printJavaScript(ast, {url});

    default:
      throw new Error('Unsupported output: ' + out);
  }
};
