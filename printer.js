const {traverse} = require("webassembly-interpreter/lib/tools");

function printExport(moduleExport, funcsTable) {
  if (moduleExport.descr.type === "Func") {
    const funcNode = funcsTable[moduleExport.descr.id.value];
    const params = funcNode.params.map(x => x.valtype).join(', ');
    const results = funcNode.result.join(', ') || 'void';

    return '- ' + moduleExport.name + '(' + params + '): ' + results;
  }

  return '- Unknown (type ' + moduleExport.descr.type + ')';
}

function printImport(moduleImport) {

  if (moduleImport.descr.type === "FuncImportDescr") {
    const params = moduleImport.descr.params.map(x => x.valtype).join(', ');
    const results = moduleImport.descr.results.join(', ') || 'void';

    return '- ' + moduleImport.module + '.' + moduleImport.name + '(' + params + '): ' + results;
  }

  return '- Unknown (type ' + moduleImport.descr.type + ')';
}

function print(ast) {
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

  out += 'Imports:';
  out += '\n';

  out += state.moduleImports.reduce((acc, e) => {
    return acc + printImport(e) + '\n';
  }, '');

  out += '\n';

  out += 'Exports:';
  out += '\n';

  out += state.moduleExports.reduce((acc, e) => {
    return acc + printExport(e, state.funcsTable) + '\n';
  }, '');

  return out;
}

module.exports = {
  print
};
