'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _defaults = require('babel-runtime/helpers/defaults')['default'];

var _interopExportWildcard = require('babel-runtime/helpers/interop-export-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.bundle = bundle;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _bundler = require('./bundler');

var bundler = _interopRequireWildcard(_bundler);

var _htmlImportTemplateBundler = require('./html-import-template-bundler');

var hitb = _interopRequireWildcard(_htmlImportTemplateBundler);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _unbundle = require('./unbundle');

_defaults(exports, _interopExportWildcard(_unbundle, _defaults));

function bundle(_config) {

  var tasks = [];
  var config = _lodash2['default'].defaults(_config, {
    force: false,
    packagePath: '.',
    bundles: {}
  });

  var bundles = config.bundles;

  _Object$keys(bundles).forEach(function (key) {

    var cfg = bundles[key];
    if (cfg.skip) return;

    if (cfg.htmlimport) {
      tasks.push(_bundleHtmlImportTemplate(cfg, key, config));
    } else {
      tasks.push(_bundle(cfg, key, config));
    }
  });

  return _bluebird2['default'].all(tasks);
}

function _bundle(_cfg, name, config) {

  var cfg = _lodash2['default'].defaults(_cfg, {
    includes: [],
    excludes: [],
    options: {}
  });

  var outfile = name + '.js';
  var opt = cfg.options;

  opt.force = config.force;
  opt.packagePath = config.packagePath;

  return bundler.bundle(cfg.includes, cfg.excludes, outfile, opt);
}

function _bundleHtmlImportTemplate(cfg, name, config) {

  var outfile = name + '.html';
  var includes = cfg.includes;
  var opt = cfg.options;

  opt.force = config.force;
  opt.packagePath = config.packagePath;

  return hitb.bundle(includes, outfile, opt);
}