'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.unbundle = unbundle;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _whacko = require('whacko');

var _whacko2 = _interopRequireDefault(_whacko);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _systemjsBuilderLibUtils = require('systemjs-builder/lib/utils');

var _systemjsBuilderLibUtils2 = _interopRequireDefault(_systemjsBuilderLibUtils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _configSerializer = require('./config-serializer');

var _utils = require('./utils');

function unbundle(_config) {
  var config = (0, _utils.getCommonConfig)(_config);

  var tasks = [removeBundles(config), removeHtmlImportBundles(config)];

  return _bluebird2['default'].all(tasks);
}

function removeBundles(cfg) {
  var appCfg = (0, _configSerializer.getAppConfig)(cfg.configPath);

  delete appCfg.bundles;

  (0, _configSerializer.saveAppConfig)(cfg.configPath, appCfg);

  return _bluebird2['default'].resolve();
}

function removeHtmlImportBundles(config) {

  var baseURL = _systemjsBuilderLibUtils2['default'].fromFileURL(config.baseURL);
  var tasks = [];

  _Object$keys(config.bundles).forEach(function (key) {

    var cfg = config.bundles[key];
    if (cfg.htmlimport) {
      tasks.push(_removeHtmlImportBundle(cfg, baseURL, key));
    }
  });

  return _bluebird2['default'].all(tasks);
}

function _removeHtmlImportBundle(_cfg, _baseURL, bundleName) {

  if (!_cfg) _bluebird2['default'].resolve();
  if (!_cfg.options) _cfg.options = {};

  var inject = _cfg.options.inject;

  if (!inject) _bluebird2['default'].resolve();
  if (!_lodash2['default'].isObject(inject)) inject = {};

  var _inject = _lodash2['default'].defaults(inject, {
    indexFile: 'index.html',
    destFile: 'index.html'
  });

  var file = _path2['default'].resolve(_baseURL, _inject.destFile);

  return _bluebird2['default'].promisify(_fs2['default'].readFile)(file, {
    encoding: 'utf8'
  }).then(function (content) {
    var $ = _whacko2['default'].load(content);
    return _bluebird2['default'].resolve($);
  }).then(function ($) {
    return removeLinkInjections($);
  }).then(function ($) {
    return _bluebird2['default'].promisify(_fs2['default'].writeFile)(file, $.html());
  });
}

function removeLinkInjections($) {
  $('link[aurelia-view-bundle]').remove();
  return _bluebird2['default'].resolve($);
}