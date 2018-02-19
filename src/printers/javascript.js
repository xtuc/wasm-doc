const {traverse} = require("webassembly-interpreter/lib/tools");

const template = require("@babel/template").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const globalInstanceIdentifier = t.identifier('instance');

const exportFuncTemplate = template(`
  export function NAME(ARGS) {
    if (typeof INSTANCE === "undefined") {
      throw new Error("Can not call function " + NAME.name + ", module not initialized.");
    }

    return INSTANCE.exports.NAME(ARGS);
  }
`);

const headerTemplate = template(`
  let INSTANCE;
`);

const initFuncTemplate = template(`
  export default function(opts) {

    if (typeof WebAssembly === "undefined") {
      throw new Error("WebAssembly not supported");
    }

    const importObject = opts;

    const getArrayBuffer = response => response.arrayBuffer();
    const instantiate = bytes => WebAssembly.instantiate(bytes, importObject);
    const getInstance = results => (instance = results.instance);

    window.fetch(URL)
      .then(getArrayBuffer)
      .then(instantiate)
      .then(getInstance);
  }
`);

function genTemplate(fn, opts) {
  const ast = fn(opts);
  return generate(ast).code;
}

function printExport(moduleExport, funcsTable) {
  if (moduleExport.descr.type === "Func") {
    const funcNode = funcsTable[moduleExport.descr.id.value];

    const params = funcNode.params
      .map(x => x.valtype)
      .map((x, k) => t.identifier('p' + k + '_' + x));

    return genTemplate(exportFuncTemplate, {
      NAME: t.identifier(moduleExport.name),
      ARGS: params,
      INSTANCE: globalInstanceIdentifier,
    }) + '\n\n';
  }

  return '';
}

function print(ast, {url}) {

  if (typeof url === "undefined") {
    throw new Error("You need to provide --url [url]");
  }

  let out = '';

  const state = {
    moduleExports: [],
    moduleImports: [],
    funcsTable: {}
  };

  traverse(ast, {

    Func({node}) {
      state.funcsTable[node.name.value] = node;
    },

    ModuleExport({node}) {
      state.moduleExports.push(node);
    },

    ModuleImport({node}) {
      state.moduleImports.push(node);
    }

  });

  out += genTemplate(headerTemplate, {
    INSTANCE: globalInstanceIdentifier,
  });

  out += "\n\n";

  out += genTemplate(initFuncTemplate, {
    URL: t.StringLiteral(url),
  });

  out += "\n\n";

  if (state.moduleExports.length > 0) {
    out += state.moduleExports.reduce((acc, e) => {
      return acc + printExport(e, state.funcsTable);
    }, '');
  }

  return out;
}

module.exports = print;
