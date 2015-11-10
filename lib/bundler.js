import jspm from 'jspm';
import config from 'jspm/lib/config';
import fs from 'fs';
import Promise from 'bluebird';
import {
  toFileURL, fromFileURL
}
from 'systemjs-builder/lib/utils';
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
  let outfile = path.resolve(fromFileURL(builder.loader.baseURL), fileName);

  if (fs.existsSync(outfile)) {
    if (!opts.force) {
      throw new Error(`A bundle named '${outfile}' is already exists. Use --force to overwrite.`);
    }
    fs.unlinkSync(outfile);
  }

  let includeExpression = includes.map(m => getFullModuleName(m, config.loader.__originalConfig.map)).join(' + ');
  let excludeExpression = excludes.map(m => getFullModuleName(m, config.loader.__originalConfig.map)).join(' - ');

  let moduleExpression = includeExpression;
  if (excludeExpression && excludeExpression.length > 0) {
    moduleExpression = `${moduleExpression} - ${excludeExpression}`;
  }

  if (!('lowResSourceMaps' in opts)) {
    opts.lowResSourceMaps = true;
  }

  if (!opts.sourceMaps) {
    removeExistingSourceMap(outfile);
  }

  return builder.trace(moduleExpression)
    .then((tree) => {
      return builder.bundle(tree, opts);
    })
    .then(function(output) {
      let hash = '';
      if (opts.rev) {
        hash = revHash(new Buffer(output.source, 'utf-8'));
        let hasedOutfile = revPath(outfile, hash);
        fs.writeFileSync(hasedOutfile, output.source);
      } else {
        fs.writeFileSync(outfile, output.source);
      }

      delete config.loader.depCache;
      if (opts.inject) injectBundle(builder, fileName, output, opts, hash);

    })
    .then(config.save);
};

function injectBundle(builder, fileName, output, opts, hash) {
  let fname = opts.rev ? revPath(fileName, hash) : fileName;

  var bundleName = builder.getCanonicalName(toFileURL(path.resolve(config.pjson.baseURL, fname)));
  if (!config.loader.bundles) {
    config.loader.bundles = {};
  }
  config.loader.bundles[bundleName] = output.modules;
}

function removeExistingSourceMap(outfile) {
  var mapFile = outfile + '.map'
  if (fs.existsSync(mapFile)) {
    fs.unlinkSync(mapFile);
  }
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
