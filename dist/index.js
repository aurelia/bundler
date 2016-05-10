'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _unbundle = require('./unbundle');

Object.keys(_unbundle).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _unbundle[key];
    }
  });
});
exports.bundle = bundle;
exports.depCache = depCache;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _bundler = require('./bundler');

var bundler = _interopRequireWildcard(_bundler);

var _htmlImportTemplateBundler = require('./html-import-template-bundler');

var hitb = _interopRequireWildcard(_htmlImportTemplateBundler);

var _utils = require('./utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bundle(_config) {
  var tasks = [];
  var config = (0, _utils.getCommonConfig)(_config);

  (0, _utils.validateConfig)(config);

  var bundles = config.bundles;
  Object.keys(bundles).forEach(function (key) {
    var cfg = bundles[key];
    if (cfg.skip) return;

    if (cfg.htmlimport) {
      tasks.push(_bundleHtmlImportTemplate(cfg, key, config));
    } else {
      tasks.push(_bundle(cfg, key, config));
    }
  });
  return _bluebird2.default.all(tasks);
}

function depCache(_config) {
  var tasks = [];
  var config = (0, _utils.getCommonConfig)(_config);

  (0, _utils.validateConfig)(config);

  var bundles = config.bundles;
  Object.keys(bundles).forEach(function (key) {
    var cfg = bundles[key];

    if (cfg.skip) return;
    if (cfg.htmlimport) return;
    tasks.push(bundler.depCache((0, _utils.getBundleConfig)(cfg, key, config)));
  });

  return _bluebird2.default.all(tasks);
}

function _bundle(_bundleCfg, bundleName, config) {
  return bundler.bundle((0, _utils.getBundleConfig)(_bundleCfg, bundleName, config));
}

function _bundleHtmlImportTemplate(_bundleCfg, bundleName, config) {
  return hitb.bundle((0, _utils.getHtmlImportBundleConfig)(_bundleCfg, bundleName, config));
}