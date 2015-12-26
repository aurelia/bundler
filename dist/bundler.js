'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.bundle = bundle;
exports.getFullModuleName = getFullModuleName;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _systemjsBuilderLibUtils = require('systemjs-builder/lib/utils');

var _systemjsBuilder = require('systemjs-builder');

var _systemjsBuilder2 = _interopRequireDefault(_systemjsBuilder);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _configSerializer = require('./config-serializer');

var _utils = require('./utils');

function bundle(cfg) {

  var appCfg = (0, _configSerializer.getAppConfig)(cfg.configPath);

  var builder = new _systemjsBuilder2['default'](cfg.baseURL, cfg.configPath);
  builder.config(cfg.builderCfg);

  if (!appCfg.map) {
    appCfg.map = {};
  }

  var includeExpression = cfg.includes.map(function (m) {
    return getFullModuleName(m, appCfg.map);
  }).join(' + ');
  var excludeExpression = cfg.excludes.map(function (m) {
    return getFullModuleName(m, appCfg.map);
  }).join(' - ');

  var moduleExpression = includeExpression;

  if (excludeExpression && excludeExpression.length > 0) {
    moduleExpression = moduleExpression + ' - ' + excludeExpression;
  }

  return builder.trace(moduleExpression).then(function (tree) {
    return builder.bundle(tree, cfg.options);
  }).then(function (output) {

    var outfile = (0, _utils.getOutFileName)(output.source, cfg.bundleName + '.js', cfg.options.rev);
    writeOutput(output, outfile, cfg.baseURL, cfg.force);

    if (cfg.options.inject) {
      injectBundle(builder, output, outfile, cfg);
    }
  });
}

;

function writeOutput(output, outfile, baseURL, force) {
  var outPath = _path2['default'].resolve((0, _systemjsBuilderLibUtils.fromFileURL)(baseURL), outfile);
  if (_fs2['default'].existsSync(outPath)) {
    if (!force) {
      throw new Error('A bundle named \'' + outPath + '\' already exists. Use the --force option to overwrite it.');
    }

    _fs2['default'].unlinkSync(outPath);
  }

  _fs2['default'].writeFileSync(outPath, output.source);
}

function injectBundle(builder, output, outfile, cfg) {
  var bundleName = builder.getCanonicalName((0, _systemjsBuilderLibUtils.toFileURL)(_path2['default'].resolve(cfg.baseURL, outfile)));

  var appCfg = (0, _configSerializer.getAppConfig)(cfg.configPath);

  if (!appCfg.bundles) {
    appCfg.bundles = {};
  }

  appCfg.bundles[bundleName] = output.modules.sort();
  (0, _configSerializer.saveAppConfig)(cfg.configPath, appCfg);
}

function getFullModuleName(moduleName, map) {
  var matches = [];
  var cleanName = function cleanName(n) {
    return n.replace(/^.*:/, '').replace(/@.*$/, '');
  };

  matches = _Object$keys(map).filter(function (m) {
    return m === moduleName;
  });

  if (matches.length === 1) {
    return moduleName;
  }

  matches = _Object$keys(map).filter(function (m) {
    return cleanName(m) === cleanName(moduleName);
  });

  if (matches.length === 1) {
    return matches[0];
  }

  if (matches.length === 0) {
    return moduleName;
  }

  throw new Error('A version conflict was found among the module names specified in the configuration for \'' + moduleName + '\'. Try including a full module name with a specific version number or resolve the conflict manually with jspm.');
}