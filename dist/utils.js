'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getOutFileName = getOutFileName;
exports.getBundleConfig = getBundleConfig;
exports.getHtmlImportBundleConfig = getHtmlImportBundleConfig;
exports.getCommonConfig = getCommonConfig;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _revPath = require('rev-path');

var _revPath2 = _interopRequireDefault(_revPath);

var _revHash = require('rev-hash');

var _revHash2 = _interopRequireDefault(_revHash);

function getOutFileName(source, fileName, rev) {
  return rev ? (0, _revPath2['default'])(fileName, (0, _revHash2['default'])(new Buffer(source, 'utf-8'))) : fileName;
}

function getBundleConfig(_bundleCfg, bundleName, config) {
  return _lodash2['default'].defaultsDeep(_bundleCfg, {
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

function getHtmlImportBundleConfig(_bundleCfg, bundleName, config) {
  var cfg = _lodash2['default'].defaultsDeep(_bundleCfg, {
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
    if (!_lodash2['default'].isObject(cfg.options.inject)) {
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
  return _lodash2['default'].defaults(_config, {
    force: false,
    baseURL: '.',
    configPath: '.',
    builderCfg: {},
    bundles: {}
  });
}