import _ from 'lodash';
import revPath from 'rev-path';
import revHash from 'rev-hash';
import fs from 'fs';
import path from 'path';

export function getOutFileName(source, fileName, rev) {
  return rev ? revPath(fileName, revHash(new Buffer(source, 'utf-8'))) : fileName;
}

export function validateConfig(config) {
  if (!fs.existsSync(config.baseURL)) {
    throw new Error(`Path '${path.resolve(config.baseURL)}' does not exist. Please provide a valid 'baseURL' in your bundle configuration.`);
  }

  let configPaths = [];
  if(typeof config.configPath === 'string') {
    configPaths.push(config.configPath);
  }
  
  if(Array.isArray(config.configPath)) {
    config.configPath.forEach(p => configPaths.push(p));
  }
  
  configPaths.forEach(p => {
    if (!fs.existsSync(p)) {
      throw new Error(`File '${path.resolve(p)}' was not found! Please provide a valid 'config.js' file for use during bundling.`);
    }
  });
}

export function getHTMLMinOpts(opts) {
  return _.defaultsDeep(opts, {
    removeComments: true,
    removeCommentsFromCDATA: true,
    removeCDATASectionsFromCDATA: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    collapseBooleanAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    caseSensitive: true,
    minifyJS: true,
    minifyCSS: true
  });
}

export function getCSSMinOpts(opts) {
  return _.defaultsDeep(opts, {
      advanced: true,
      agressiveMerging: true,
      mediaMerging: true,
      restructuring: true,
      shorthandCompacting: true,
  });
}

export function getBundleConfig(_bundleCfg, bundleName, config) {
  return _.defaultsDeep(_bundleCfg, {
    includes: [],
    excludes: [],
    options: {
      rev: false,
      minify: false,
      inject: true,
      htmlminopts: {},
      cssminopts: {},
    },
    bundleName: bundleName,
    force: config.force,
    baseURL: config.baseURL,
    configPath: config.configPath,
    builderCfg: config.builderCfg,
    injectionConfigPath: config.injectionConfigPath});
}

export function getHtmlImportBundleConfig(_bundleCfg, bundleName, config) {
  let cfg = _.defaultsDeep(_bundleCfg, {
    htmlimport: true,
    includes: '*.html',
    bundleName: bundleName,
    options: {
      inject: false
    },
    force: config.force,
    baseURL: config.baseURL,
    configPath: config.configPath,
    builderCfg: config.builderCfg
  });

  if (cfg.options.inject) {
    if (!_.isObject(cfg.options.inject)) {
      cfg.options.inject = {
        indexFile: 'index.html',
        destFile: 'index.html'
      }
    } else {
      cfg.options.inject.indexFile = cfg.options.inject.indexFile || 'index.html';
      cfg.options.inject.destFile = cfg.options.inject.destFile || 'index.html';
    }
  }

  return cfg;
}

export function getCommonConfig(_config) {
  return _.defaults(_config, {
    force: false,
    baseURL: '.',
    configPath: './config.js',
    injectionConfigPath: getDefaultInjectionConfigFilePath(_config.configPath),
    builderCfg: {},
    bundles: {}
  });
}

function getDefaultInjectionConfigFilePath(configPath) {
  if(typeof configPath === 'string') {
     return configPath;
  }
  if(Array.isArray(configPath)) {
    return configPath[0];
  }
  
  throw new Error('No bundle injection config file path provided. Set `injectionConfigPath` property in the bundle config.');
}
