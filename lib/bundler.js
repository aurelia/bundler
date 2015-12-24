import fs from 'fs';
import Promise from 'bluebird';
import { toFileURL, fromFileURL } from 'systemjs-builder/lib/utils';
import Builder from 'systemjs-builder';
import path from 'path';
import _ from 'lodash';
import {getAppConfig, saveAppConfig} from './config-serializer';
import {getOutFileName} from './utils';

export function bundle(cfg) {

  let appCfg = getAppConfig(cfg.configPath);

  let builder = new Builder(cfg.baseURL, cfg.configPath);
  builder.config(cfg.builderCfg);

  if(!appCfg.map){
    appCfg.map = {};
  }

  let includeExpression = cfg.includes.map(m => getFullModuleName(m, appCfg.map)).join(' + ');
  let excludeExpression = cfg.excludes.map(m => getFullModuleName(m, appCfg.map)).join(' - ');

  let moduleExpression = includeExpression;

  if (excludeExpression && excludeExpression.length > 0) {
    moduleExpression = `${moduleExpression} - ${excludeExpression}`;
  }

  return builder.trace(moduleExpression)
    .then((tree) => {
      return builder.bundle(tree, cfg.options);
    })
    .then((output) => {

      let outfile = getOutFileName(output.source, cfg.bundleName + '.js', cfg.options.rev);
      writeOutput(output, outfile, cfg.baseURL, cfg.force);

      if (cfg.options.inject) {
        injectBundle(builder, output, outfile, cfg);
      }
    });
};


function writeOutput(output, outfile, baseURL, force) {
  let outPath = path.resolve(fromFileURL(baseURL), outfile);
  if (fs.existsSync(outPath)) {
    if (!force) {
      throw new Error(`A bundle named '${outPath}' already exists. Use the --force option to overwrite it.`);
    }

    fs.unlinkSync(outPath);
  }

  fs.writeFileSync(outPath, output.source);
}

function injectBundle(builder, output, outfile, cfg) {
  let bundleName = builder.getCanonicalName(toFileURL(path.resolve(cfg.baseURL, outfile)));

  let appCfg = getAppConfig(cfg.configPath);

  if (!appCfg.bundles) {
    appCfg.bundles = {};
  }

  appCfg.bundles[bundleName] = output.modules.sort();
  saveAppConfig(cfg.configPath, appCfg);
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
    `A version conflict was found among the module names specified in the configuration for '${moduleName}'. Try including a full module name with a specific version number or resolve the conflict manually with jspm.`);

}
