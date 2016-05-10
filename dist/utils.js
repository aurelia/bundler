'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOutFileName = getOutFileName;
exports.validateConfig = validateConfig;
exports.getHTMLMinOpts = getHTMLMinOpts;
exports.getCSSMinOpts = getCSSMinOpts;
exports.getBundleConfig = getBundleConfig;
exports.getHtmlImportBundleConfig = getHtmlImportBundleConfig;
exports.getCommonConfig = getCommonConfig;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _revPath = require('rev-path');

var _revPath2 = _interopRequireDefault(_revPath);

var _revHash = require('rev-hash');

var _revHash2 = _interopRequireDefault(_revHash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getOutFileName(source, fileName, rev) {
  return rev ? (0, _revPath2.default)(fileName, (0, _revHash2.default)(new Buffer(source, 'utf-8'))) : fileName;
}

function validateConfig(config) {
  if (!_fs2.default.existsSync(config.baseURL)) {
    throw new Error('Path \'' + _path2.default.resolve(config.baseURL) + '\' does not exist. Please provide a valid \'baseURL\' in your bundle configuration.');
  }

  var configPaths = [];
  if (typeof config.configPath === 'string') {
    configPaths.push(config.configPath);
  }

  if (Array.isArray(config.configPath)) {
    config.configPath.forEach(function (p) {
      return configPaths.push(p);
    });
  }

  configPaths.forEach(function (p) {
    if (!_fs2.default.existsSync(p)) {
      throw new Error('File \'' + _path2.default.resolve(p) + '\' was not found! Please provide a valid \'config.js\' file for use during bundling.');
    }
  });
}

function getHTMLMinOpts(opts) {
  return _lodash2.default.defaultsDeep(opts, {
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

function getCSSMinOpts(opts) {
  return _lodash2.default.defaultsDeep(opts, {
    advanced: true,
    agressiveMerging: true,
    mediaMerging: true,
    restructuring: true,
    shorthandCompacting: true
  });
}

function getBundleConfig(_bundleCfg, bundleName, config) {
  return _lodash2.default.defaultsDeep(_bundleCfg, {
    includes: [],
    excludes: [],
    options: {
      rev: false,
      minify: false,
      inject: true,
      htmlminopts: {},
      cssminopts: {}
    },
    bundleName: bundleName,
    force: config.force,
    baseURL: config.baseURL,
    configPath: config.configPath,
    builderCfg: config.builderCfg,
    injectionConfigPath: config.injectionConfigPath });
}

function getHtmlImportBundleConfig(_bundleCfg, bundleName, config) {
  var cfg = _lodash2.default.defaultsDeep(_bundleCfg, {
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
    if (!_lodash2.default.isObject(cfg.options.inject)) {
      cfg.options.inject = {
        indexFile: 'index.html',
        destFile: 'index.html'
      };
    } else {
      cfg.options.inject.indexFile = cfg.options.inject.indexFile || 'index.html';
      cfg.options.inject.destFile = cfg.options.inject.destFile || 'index.html';
    }
  }

  return cfg;
}

function getCommonConfig(_config) {
  return _lodash2.default.defaults(_config, {
    force: false,
    baseURL: '.',
    configPath: './config.js',
    injectionConfigPath: getDefaultInjectionConfigFilePath(_config.configPath),
    builderCfg: {},
    bundles: {}
  });
}

function getDefaultInjectionConfigFilePath(configPath) {
  if (typeof configPath === 'string') {
    return configPath;
  }
  if (Array.isArray(configPath)) {
    return configPath[0];
  }

  throw new Error('No bundle injection config file path provided. Set `injectionConfigPath` property in the bundle config.');
}