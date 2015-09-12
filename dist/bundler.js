'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.bundle = bundle;

var _jspm = require('jspm');

var _jspm2 = _interopRequireDefault(_jspm);

var _jspmLibConfig = require('jspm/lib/config');

var _jspmLibConfig2 = _interopRequireDefault(_jspmLibConfig);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _systemjsBuilderLibUtils = require('systemjs-builder/lib/utils');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function bundle(includes, excludes, fileName, _opts) {
  var opts = _lodash2['default'].defaultsDeep(_opts, {
    packagePath: '.'
  });

  _jspm2['default'].setPackagePath(opts.packagePath);

  var builderCfg = opts.builderCfg || {};
  var builder = new _jspm2['default'].Builder(builderCfg);
  var outfile = _path2['default'].resolve((0, _systemjsBuilderLibUtils.fromFileURL)(builder.loader.baseURL), fileName);

  if (_fs2['default'].existsSync(outfile)) {
    if (!opts.force) {
      throw new Error('A bundle named \'' + outfile + '\' is already exists. Use --force to overwrite.');
    }
    _fs2['default'].unlinkSync(outfile);
  }

  var includeExpression = includes.map(function (m) {
    return getFullModuleName(m, _jspmLibConfig2['default'].loader.__originalConfig.map);
  }).join(' + ');
  var excludeExpression = excludes.map(function (m) {
    return getFullModuleName(m, _jspmLibConfig2['default'].loader.__originalConfig.map);
  }).join(' - ');

  var moduleExpression = includeExpression;
  if (excludeExpression && excludeExpression.length > 0) {
    moduleExpression = moduleExpression + ' - ' + excludeExpression;
  }

  if (!('lowResSourceMaps' in opts)) {
    opts.lowResSourceMaps = true;
  }

  if (!opts.sourceMaps) {
    removeExistingSourceMap(outfile);
  }

  return builder.trace(moduleExpression).then(function (tree) {
    return builder.buildTree(tree, outfile, opts);
  }).then(function (output) {
    delete _jspmLibConfig2['default'].loader.depCache;
    if (opts.inject) injectBundle(builder, fileName, output);
  }).then(_jspmLibConfig2['default'].save);
}

;

function injectBundle(builder, fileName, output) {
  var bundleName = builder.getCanonicalName((0, _systemjsBuilderLibUtils.toFileURL)(_path2['default'].resolve(_jspmLibConfig2['default'].pjson.baseURL, fileName)));
  if (!_jspmLibConfig2['default'].loader.bundles) {
    _jspmLibConfig2['default'].loader.bundles = {};
  }
  _jspmLibConfig2['default'].loader.bundles[bundleName] = output.modules;
}

function removeExistingSourceMap(outfile) {
  var mapFile = outfile + '.map';
  if (_fs2['default'].existsSync(mapFile)) {
    _fs2['default'].unlinkSync(mapFile);
  }
}

function getFullModuleName(moduleName, map) {
  var matches = [];
  _Object$keys(map).forEach(function (m) {
    if (m.startsWith(moduleName)) {
      matches.push(m);
    }
  });

  if (matches.length === 0) {
    return moduleName;
  }

  if (matches.length > 1) {
    throw new Error('Version conflict found in module names specified in configuration for \'' + moduleName + '\'. Try including a specific version or resolve the conflict manually with jspm');
  }

  return matches[0];
}