'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getOutFileName = getOutFileName;
exports.getBundleConfig = getBundleConfig;
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
  return _lodash2['default'].defaults(_bundleCfg, {
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

function getCommonConfig(_config) {
  return _lodash2['default'].defaults(_config, {
    force: false,
    baseURL: '.',
    configPath: '.',
    builderCfg: {},
    bundles: {}
  });
}