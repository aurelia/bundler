import * as _ from 'lodash';
import * as revPath from 'rev-path';
import * as revHash from 'rev-hash';
import * as fs from 'fs';
import * as path from 'path';
import {Config, BundleConfig, ConfigBody, ConfigHeader} from './models';

export function getOutFileName(source: string, fileName: string, rev: boolean) {
  return rev ? revPath(fileName, revHash(new Buffer(source, 'utf-8'))) : fileName;
}

export function validateConfig(config: Config) {
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

export function getHTMLMinOpts(opts: any) {
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
    ignoreCustomFragments: [/\${[\s\S]*}/],
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });
}

export function getCSSMinOpts(opts: any) {
  return _.defaultsDeep(opts, {
    advanced: true,
    agressiveMerging: true,
    mediaMerging: true,
    restructuring: true,
    shorthandCompacting: true,
  });
}

export function getBundleConfig(bundleCfg: ConfigBody, bundleName: string, config: Config) {
  return _.defaultsDeep<ConfigBody, BundleConfig>(bundleCfg, {
    baseURL: config.baseURL,
    builderCfg: config.builderCfg,
    bundleName: bundleName,
    configPath: config.configPath,
    excludes: [],
    includes: [],
    outputPath: config.outputPath,
    injectionConfigPath: config.injectionConfigPath,
    force: config.force,
    options: {
      depCache: false,
      cssminopts: {},
      htmlminopts: {},
      inject: true,
      minify: false,
      rev: false,
    },
  });
}

export function getHtmlImportBundleConfig(bundleCfg: ConfigBody, bundleName: string, config: ConfigHeader) {
  let cfg = _.defaultsDeep<ConfigBody, BundleConfig>(bundleCfg, {
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

export function ensureDefaults(config: Config) {
  return _.defaults<Config>(config, {
    baseURL: '.',
    builderCfg: {},
    bundles: {},
    configPath: './config.js',
    force: false,
    injectionConfigPath: getDefaultInjectionConfigFilePath(config.configPath),
  });
}

function getDefaultInjectionConfigFilePath(configPath: string|string[]) {
  if (typeof configPath === 'string') {
    return configPath;
  }

  if (Array.isArray(configPath)) {
    return configPath[0];
  }
  throw new Error(
    'No bundle injection config file path provided. Set `injectionConfigPath` property in the bundle config.');
}
