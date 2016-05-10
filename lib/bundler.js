import fs from 'fs';
import Promise from 'bluebird';
import {
  toFileURL, fromFileURL
}
from 'systemjs-builder/lib/utils';
import Builder from 'systemjs-builder';
import path from 'path';
import _ from 'lodash';
import {
  getAppConfig, saveAppConfig
}
from './config-serializer';
import * as utils from './utils';
import htmlminifier from 'html-minifier';
import CleanCSS from 'clean-css';

function createBuildExpression(cfg) {
  let appCfg = getAppConfig(cfg.configPath);
  let includeExpression = cfg.includes.map(m => getFullModuleName(m, appCfg.map)).join(' + ');
  let excludeExpression = cfg.excludes.map(m => getFullModuleName(m, appCfg.map)).join(' - ');
  let buildExpression = includeExpression;

  if (excludeExpression && excludeExpression.length > 0) {
    buildExpression = `${buildExpression} - ${excludeExpression}`;
  }

  return buildExpression;
}

function createFetchHook(cfg) {
  return function(load, fetch) {
    let address = fromFileURL(load.address);
    let ext = path.extname(address);

    if(ext !== '.html' || ext !== '.css') {
      return fetch(load);
    }
    
    let plugin = path.basename(fromFileURL(load.name.split('!')[1]));

    if(!plugin.startsWith('plugin-text')) {
      return fetch(load);
    }

    if (ext === '.html' && cfg.options.minify) {
      let content = fs.readFileSync(address, 'utf8');
      let opts = utils.getHTMLMinOpts(cfg.options.htmlminopts);

      return htmlminifier.minify(content, opts);
    }

    if (ext === '.css' && cfg.options.minify) {
      let content = fs.readFileSync(address, 'utf8');
      let opts = utils.getCSSMinOpts(cfg.options.cssminopts);

      let output = new CleanCSS(opts).minify(content);

      if (output.errors.length) {
        throw new Error('CSS Plugin:\n' + output.errors.join('\n'));
      }

      return output.styles;
    }

    return fetch(load);
  };
}

export function bundle(cfg) {
  let buildExpression = createBuildExpression(cfg);
  cfg.options.fetch = createFetchHook(cfg);

  let tasks = [
    _bundle(buildExpression, cfg)
  ];

  if (cfg.options.depCache) {
    tasks.push(_depCache(buildExpression, cfg));
  }

  return Promise.all(tasks);
}

export function depCache(cfg) {
  let buildExpression = createBuildExpression(cfg);
  return _depCache(buildExpression, cfg);
}

function createBuilder(cfg) {
  let builder = new Builder(cfg.baseURL);
  let appCfg = getAppConfig(cfg.configPath);

  delete appCfg.baseURL;
  
  builder.config(appCfg);
  builder.config(cfg.builderCfg);
  
  return builder;
}

function _depCache(buildExpression, cfg) {
  let builder = createBuilder(cfg);
  
  return builder.trace(buildExpression, cfg.options)
    .then(tree => {
      let _dc = builder.getDepCache(tree);

      let configPath = cfg.injectionConfigPath;
      let appCfg = getAppConfig(configPath);
      
      let dc = appCfg.depCache || {};

      _.assign(dc, _dc);
      appCfg.depCache = dc;

      saveAppConfig(configPath, appCfg);

      return Promise.resolve();
    });
}


function _bundle(buildExpression, cfg) {
  let builder = createBuilder(cfg);

  return builder.bundle(buildExpression, cfg.options)
    .then((output) => {
      let outfile = utils.getOutFileName(output.source, cfg.bundleName + '.js', cfg.options.rev);
      writeOutput(output, outfile, cfg.baseURL, cfg.force);

      if (cfg.options.inject) {
        injectBundle(builder, output, outfile, cfg);
      }

      return Promise.resolve();
    });
}


export function writeOutput(output, outfile, baseURL, force) {
  let outPath = path.resolve(baseURL, outfile);

  if (fs.existsSync(outPath)) {
    if (!force) {
      throw new Error(`A bundle named '${outPath}' already exists. Use the --force option to overwrite it.`);
    }

    fs.unlinkSync(outPath);
  } else {
    let dirpath = path.dirname(outPath);

    if (!fs.existsSync(dirpath)) {
      fs.mkdirSync(dirpath);
    }
  }

  fs.writeFileSync(outPath, output.source);
}


export function injectBundle(builder, output, outfile, cfg) {
  let configPath = cfg.injectionConfigPath;
  let bundleName = builder.getCanonicalName(toFileURL(path.resolve(cfg.baseURL, outfile)));
  let appCfg = getAppConfig(configPath)

  if (!appCfg.bundles) {
    appCfg.bundles = {};
  }

  appCfg.bundles[bundleName] = output.modules.sort();
  saveAppConfig(configPath, appCfg);
}

export function getFullModuleName(moduleName, map) {
  let matches = [];
  let cleanName = n => n.replace(/^.*:/, '').replace(/@.*$/, '');

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