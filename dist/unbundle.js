'use strict';

Object.defineProperty(exports, "__esModule", {
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

var _utils = require('systemjs-builder/lib/utils');

var _utils2 = _interopRequireDefault(_utils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _configSerializer = require('./config-serializer');

var _utils3 = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function unbundle(_config) {
  var config = (0, _utils3.getCommonConfig)(_config);
  (0, _utils3.validateConfig)(config);

  var tasks = [removeBundles(config), removeHtmlImportBundles(config)];

  return _bluebird2.default.all(tasks);
}

function removeBundles(cfg) {
  var configPath = cfg.injectionConfigPath;
  var appCfg = (0, _configSerializer.getAppConfig)(configPath);
  delete appCfg.bundles;
  delete appCfg.depCache;
  (0, _configSerializer.saveAppConfig)(configPath, appCfg);

  return _bluebird2.default.resolve();
}

function removeHtmlImportBundles(config) {
  var tasks = [];

  Object.keys(config.bundles).forEach(function (key) {
    var cfg = config.bundles[key];
    if (cfg.htmlimport) {
      tasks.push(_removeHtmlImportBundle((0, _utils3.getHtmlImportBundleConfig)(cfg, key, config)));
    }
  });

  return _bluebird2.default.all(tasks);
}

function _removeHtmlImportBundle(cfg) {

  var file = _path2.default.resolve(cfg.baseURL, cfg.options.inject.destFile);

  if (!_fs2.default.existsSync(file)) {
    return _bluebird2.default.resolve();
  }

  return _bluebird2.default.promisify(_fs2.default.readFile)(file, {
    encoding: 'utf8'
  }).then(function (content) {
    var $ = _whacko2.default.load(content);
    return _bluebird2.default.resolve($);
  }).then(function ($) {
    return removeLinkInjections($);
  }).then(function ($) {
    return _bluebird2.default.promisify(_fs2.default.writeFile)(file, $.html());
  });
}

function removeLinkInjections($) {
  $('link[aurelia-view-bundle]').remove();
  return _bluebird2.default.resolve($);
}