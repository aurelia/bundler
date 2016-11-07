import * as _ from 'lodash';
import * as revPath from 'rev-path';
import * as revHash from 'rev-hash';
import * as fs from 'fs';
import * as path from 'path';

export interface BundleOption {
  skip?: boolean;
  htmlimport?: boolean;
  baseURL?: string;
  bundleName?: string;
  includes: string[] | string;
  excludes?: string[];
  injectionConfigPath?: string;
  options: {
    inject: boolean | {
      indexFile: string,
      destFile: string
    },
    minify: boolean,
    htmlminopts?: any,
    cssminopts?: any,
    rev?: boolean,
  };
}

export interface BundleConfig {
  force?: boolean;
  baseURL: string;
  configPath: string | string[];
  injectionConfigPath?: string;
  bundles: {[name: string]: BundleOption};
  builderCfg?: any;
}

export function getOutFileName(source, fileName, rev) {
  return rev ? revPath(fileName, revHash(new Buffer(source, 'utf-8'))) : fileName;
}

export function validateConfig(config: BundleConfig) {
  if (!fs.existsSync(config.baseURL)) {
    throw new Error(
      `Path '${path.resolve(config.baseURL)}' does not exist. Please provide a valid 'baseURL' in your bundle configuration.`);
  }
  let configPaths: string[] = [];
  let configPath = config.configPath;

  if (typeof configPath === 'string') {
    configPaths.push(configPath);
  } else {
    configPath.forEach(p => configPaths.push(p));
  }

  configPaths.forEach(p => {
    if (!fs.existsSync(p)) {
      throw new Error(
        `File '${path.resolve(p)}' was not found! Please provide a valid 'config.js' file for use during bundling.`);
    }
  });
}

export function getHTMLMinOpts(opts) {
  return _.defaultsDeep(opts, {
    caseSensitive: true,
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeCDATASectionsFromCDATA: true,
    removeComments: true,
    removeCommentsFromCDATA: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: false,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
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

export function getBundleConfig(bundleCfg, bundleName: string, config: BundleConfig): BundleOption {
  return _.defaultsDeep<BundleOption, BundleOption>(bundleCfg, {
    baseURL: config.baseURL,
    builderCfg: config.builderCfg,
    bundleName: bundleName,
    configPath: config.configPath,
    excludes: [],
    includes: [],
    injectionConfigPath: config.injectionConfigPath,
    force: config.force,
    options: {
      cssminopts: {},
      htmlminopts: {},
      inject: true,
      minify: false,
      rev: false,
    },
  });
}

export function getHtmlImportBundleConfig(bundleCfg, bundleName: string, config): BundleOption {
  let cfg = _.defaultsDeep<BundleOption, BundleOption>(bundleCfg, {
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

  if (!cfg.options.inject) {
    return cfg;
  }

  if (typeof cfg.options.inject === 'boolean') {
    cfg.options.inject = {
      indexFile: 'index.html',
      destFile: 'index.html'
    };
  } else {
    cfg.options.inject.indexFile = cfg.options.inject.indexFile || 'index.html';
    cfg.options.inject.destFile = cfg.options.inject.destFile || 'index.html';
  }

  return cfg;
}

export function getCommonConfig(config) {
  return _.defaults(config, {
    baseURL: '.',
    builderCfg: {},
    bundles: {},
    configPath: './config.js',
    force: false,
    injectionConfigPath: getDefaultInjectionConfigFilePath(config.configPath),
  });
}

function getDefaultInjectionConfigFilePath(configPath) {
  if (typeof configPath === 'string') {
    return configPath;
  }

  if (Array.isArray(configPath)) {
    return configPath[0];
  }
  throw new Error(
    'No bundle injection config file path provided. Set `injectionConfigPath` property in the bundle config.');
}
