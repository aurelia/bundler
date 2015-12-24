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
    throw new Error(`Path '${path.resolve(config.baseURL)}' not exits. Please provide a valid 'baseURL'.`);
  }

  if (!fs.existsSync(config.configPath)) {
    throw new Error(`File '${path.resolve(config.configPath)}' not found! Please provide a valid 'config' file.`);
  }
}

export function getBundleConfig(_bundleCfg, bundleName, config) {
  return _.defaultsDeep(_bundleCfg, {
    includes: [],
    excludes: [],
    options: {
      rev: false,
      minify: false,
      inject: true
    },
    bundleName: bundleName,
    force: config.force,
    baseURL: config.baseURL,
    configPath: config.configPath,
    builderCfg: config.builderCfg
  });
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
    builderCfg: {},
    bundles: {}
  });
}
