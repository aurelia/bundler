'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.bundle = bundle;
exports.getFullModuleName = getFullModuleName;

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

var _revHash = require('rev-hash');

var _revHash2 = _interopRequireDefault(_revHash);

var _revPath = require('rev-path');

var _revPath2 = _interopRequireDefault(_revPath);

function bundle(includes, excludes, fileName, _opts) {
  var opts = _lodash2['default'].defaultsDeep(_opts, {
    packagePath: '.',
    rev: false
  });

  _jspm2['default'].setPackagePath(opts.packagePath);

  var builderCfg = opts.builderCfg || {};

  var builder = new _jspm2['default'].Builder(builderCfg);

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

  return builder.trace(moduleExpression).then(function (tree) {
    return builder.bundle(tree, opts);
  }).then(function (output) {

    var outfile = getOutFileName(output, fileName, opts.rev);
    writeOutput(output, outfile, builder.loader.baseURL, opts.force);

    delete _jspmLibConfig2['default'].loader.depCache;
    if (opts.inject) injectBundle(builder, output, outfile);
  }).then(_jspmLibConfig2['default'].save);
}

;

function getOutFileName(output, fileName, rev) {
  return rev ? (0, _revPath2['default'])(fileName, (0, _revHash2['default'])(new Buffer(output.source, 'utf-8'))) : fileName;
}

function writeOutput(output, outfile, baseURL, force) {

  var outPath = _path2['default'].resolve((0, _systemjsBuilderLibUtils.fromFileURL)(baseURL), outfile);

  if (_fs2['default'].existsSync(outPath)) {
    if (!force) {
      throw new Error('A bundle named \'' + outPath + '\' is already exists. Use --force to overwrite.');
    }

    _fs2['default'].unlinkSync(outPath);
  }

  _fs2['default'].writeFileSync(outPath, output.source);
}

function injectBundle(builder, output, outfile) {

  var bundleName = builder.getCanonicalName((0, _systemjsBuilderLibUtils.toFileURL)(_path2['default'].resolve(_jspmLibConfig2['default'].pjson.baseURL, outfile)));

  if (!_jspmLibConfig2['default'].loader.bundles) {
    _jspmLibConfig2['default'].loader.bundles = {};
  }

  _jspmLibConfig2['default'].loader.bundles[bundleName] = output.modules.sort();
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

  throw new Error('Version conflict found in module names specified in configuration for \'' + moduleName + '\'. Try including  full module name with a specific version number or resolve the conflict manually with jspm');
}