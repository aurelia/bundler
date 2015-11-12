import jspm from 'jspm';
import config from 'jspm/lib/config';
import fs from 'fs';
import Promise from 'bluebird';
import { toFileURL, fromFileURL } from 'systemjs-builder/lib/utils';
import path from 'path';
import _ from 'lodash';
import revHash from 'rev-hash';
import revPath from 'rev-path';

export function bundle(includes, excludes, fileName, _opts) {
  let opts = _.defaultsDeep(_opts, {
    packagePath: '.',
    rev: false
  });

  jspm.setPackagePath(opts.packagePath);

  let builderCfg = opts.builderCfg || {};

  let builder = new jspm.Builder(builderCfg);

  let includeExpression = includes.map(m => getFullModuleName(m, config.loader.__originalConfig.map)).join(' + ');
  let excludeExpression = excludes.map(m => getFullModuleName(m, config.loader.__originalConfig.map)).join(' - ');

  let moduleExpression = includeExpression;

  if (excludeExpression && excludeExpression.length > 0) {
    moduleExpression = `${moduleExpression} - ${excludeExpression}`;
  }

  return builder.trace(moduleExpression)
    .then((tree) => {
      return builder.bundle(tree, opts);
    })
    .then((output) => {

      let outfile = getOutFileName(output, fileName, opts.rev);
      writeOutput(output, outfile, builder.loader.baseURL, opts.force);
      
      delete config.loader.depCache;
      if (opts.inject) injectBundle(builder, output, outfile);

    })
    .then(config.save);
};


function getOutFileName(output, fileName, rev) {
  return rev ? revPath(fileName, revHash(new Buffer(output.source, 'utf-8'))) : fileName;
}

function writeOutput(output, outfile, baseURL, force) {

  let outPath = path.resolve(fromFileURL(baseURL), outfile);

  if (fs.existsSync(outPath)) {
    if (!force) {
      throw new Error(`A bundle named '${outPath}' is already exists. Use --force to overwrite.`);
    }

    fs.unlinkSync(outPath);
  }

  fs.writeFileSync(outPath, output.source);
}

function injectBundle(builder, output, outfile) {

  var bundleName = builder.getCanonicalName(toFileURL(path.resolve(config.pjson.baseURL, outfile)));

  if (!config.loader.bundles) {
    config.loader.bundles = {};
  }

  config.loader.bundles[bundleName] = output.modules.sort();
}


export function getFullModuleName(moduleName, map) {
  let matches = [];
  let cleanName = n =>  n.replace(/^.*:/, '').replace(/@.*$/, '');

  matches = Object.keys(map).filter(m => m === moduleName); 

  if (matches.length === 1) { 
    return moduleName;
  }

  matches = Object.keys(map).filter(m => {
    return cleanName(m) === cleanName(moduleName);
  });

  if (matches.length === 1) {
    return matches[0];
  }

  if (matches.length === 0) {
    return moduleName;
  }

  throw new Error(
    `Version conflict found in module names specified in configuration for '${moduleName}'. Try including  full module name with a specific version number or resolve the conflict manually with jspm`);

}
