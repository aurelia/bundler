'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.bundle = bundle;
exports.depCache = depCache;
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

var utils = _interopRequireWildcard(_utils);

var _htmlMinifier = require('html-minifier');

var _htmlMinifier2 = _interopRequireDefault(_htmlMinifier);

var _cleanCss = require('clean-css');

var _cleanCss2 = _interopRequireDefault(_cleanCss);

function createBuildExpression(cfg) {
  var appCfg = (0, _configSerializer.getAppConfig)(cfg.configPath);
  var includeExpression = cfg.includes.map(function (m) {
    return getFullModuleName(m, appCfg.map);
  }).join(' + ');
  var excludeExpression = cfg.excludes.map(function (m) {
    return getFullModuleName(m, appCfg.map);
  }).join(' - ');
  var buildExpression = includeExpression;

  if (excludeExpression && excludeExpression.length > 0) {
    buildExpression = buildExpression + ' - ' + excludeExpression;
  }

  return buildExpression;
}

function createFetchHook(cfg) {
  return function (load, fetch) {
    var address = (0, _systemjsBuilderLibUtils.fromFileURL)(load.address);
    var ext = _path2['default'].extname(address);

    if (ext === '.html' && cfg.options.minify) {
      var content = _fs2['default'].readFileSync(address, 'utf8');
      var opts = utils.getHTMLMinOpts(cfg.options.htmlminopts);

      return _htmlMinifier2['default'].minify(content, opts);
    }

    if (ext === '.css' && cfg.options.minify) {
      var content = _fs2['default'].readFileSync(address, 'utf8');
      var opts = utils.getCSSMinOpts(cfg.options.cssminopts);

      return new _cleanCss2['default'](opts).minify(content).styles;
    }

    return fetch(load);
  };
}

function bundle(cfg) {

  var buildExpression = createBuildExpression(cfg);
  cfg.options.fetch = createFetchHook(cfg);

  var tasks = [_bundle(buildExpression, cfg)];

  if (cfg.options.depCache) {
    tasks.push(_depCache(buildExpression, cfg));
  }

  return _bluebird2['default'].all(tasks);
}

;

function depCache(cfg) {
  var buildExpression = createBuildExpression(cfg);
  return _depCache(buildExpression, cfg);
}

function _depCache(buildExpression, cfg) {

  var builder = new _systemjsBuilder2['default'](cfg.baseURL, cfg.configPath);
  builder.config(cfg.builderCfg);

  return builder.trace(buildExpression, cfg.options).then(function (tree) {
    var _depCache = builder.getDepCache(tree);

    var appCfg = (0, _configSerializer.getAppConfig)(cfg.configPath);
    var depCache = appCfg.depCache || {};

    _lodash2['default'].assign(depCache, _depCache);
    appCfg.depCache = depCache;

    (0, _configSerializer.saveAppConfig)(cfg.configPath, appCfg);

    return _bluebird2['default'].resolve();
  });
}

function _bundle(buildExpression, cfg) {

  var builder = new _systemjsBuilder2['default'](cfg.baseURL, cfg.configPath);
  builder.config(cfg.builderCfg);

  return builder.bundle(buildExpression, cfg.options).then(function (output) {

    var outfile = utils.getOutFileName(output.source, cfg.bundleName + '.js', cfg.options.rev);
    writeOutput(output, outfile, cfg.baseURL, cfg.force);

    if (cfg.options.inject) {
      injectBundle(builder, output, outfile, cfg);
    }

    return _bluebird2['default'].resolve();
  });
}

function writeOutput(output, outfile, baseURL, force) {
  var outPath = _path2['default'].resolve(baseURL, outfile);

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