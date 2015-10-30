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

function getFullModuleName(moduleName, map) {
  var plainPackageName = moduleName.replace(/^.*:/, '');
  var matches = [];
  Object.keys(map)
    .forEach(m => {
      let strippedName = m.replace(/^.*:/, '').replace(/@.*$/, '');
      if (strippedName === plainPackageName) {
        matches.push(m);
      }
    });

  if (matches.length === 0) {
    return moduleName;
  }

  if (matches.length > 1) {
    throw new Error(
      `Version conflict found in module names specified in configuration for '${moduleName}'. Try including a specific version or resolve the conflict manually with jspm`);
  }

  return matches[0];
}
