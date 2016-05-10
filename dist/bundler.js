'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bundle = bundle;
exports.depCache = depCache;
exports.writeOutput = writeOutput;
exports.injectBundle = injectBundle;
exports.getFullModuleName = getFullModuleName;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _utils = require('systemjs-builder/lib/utils');

var _systemjsBuilder = require('systemjs-builder');

var _systemjsBuilder2 = _interopRequireDefault(_systemjsBuilder);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _configSerializer = require('./config-serializer');

var _utils2 = require('./utils');

var utils = _interopRequireWildcard(_utils2);

var _htmlMinifier = require('html-minifier');

var _htmlMinifier2 = _interopRequireDefault(_htmlMinifier);

var _cleanCss = require('clean-css');

var _cleanCss2 = _interopRequireDefault(_cleanCss);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var address = (0, _utils.fromFileURL)(load.address);
    var ext = _path2.default.extname(address);

    if (ext !== '.html' || ext !== '.css') {
      return fetch(load);
    }

    var plugin = _path2.default.basename((0, _utils.fromFileURL)(load.name.split('!')[1]));

    if (!plugin.startsWith('plugin-text')) {
      return fetch(load);
    }

    if (ext === '.html' && cfg.options.minify) {
      var content = _fs2.default.readFileSync(address, 'utf8');
      var opts = utils.getHTMLMinOpts(cfg.options.htmlminopts);

      return _htmlMinifier2.default.minify(content, opts);
    }

    if (ext === '.css' && cfg.options.minify) {
      var _content = _fs2.default.readFileSync(address, 'utf8');
      var _opts = utils.getCSSMinOpts(cfg.options.cssminopts);

      var output = new _cleanCss2.default(_opts).minify(_content);

      if (output.errors.length) {
        throw new Error('CSS Plugin:\n' + output.errors.join('\n'));
      }

      return output.styles;
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

  return _bluebird2.default.all(tasks);
}

function depCache(cfg) {
  var buildExpression = createBuildExpression(cfg);
  return _depCache(buildExpression, cfg);
}

function createBuilder(cfg) {
  var builder = new _systemjsBuilder2.default(cfg.baseURL);
  var appCfg = (0, _configSerializer.getAppConfig)(cfg.configPath);

  delete appCfg.baseURL;

  builder.config(appCfg);
  builder.config(cfg.builderCfg);

  return builder;
}

function _depCache(buildExpression, cfg) {
  var builder = createBuilder(cfg);

  return builder.trace(buildExpression, cfg.options).then(function (tree) {
    var _dc = builder.getDepCache(tree);

    var configPath = cfg.injectionConfigPath;
    var appCfg = (0, _configSerializer.getAppConfig)(configPath);

    var dc = appCfg.depCache || {};

    _lodash2.default.assign(dc, _dc);
    appCfg.depCache = dc;

    (0, _configSerializer.saveAppConfig)(configPath, appCfg);

    return _bluebird2.default.resolve();
  });
}

function _bundle(buildExpression, cfg) {
  var builder = createBuilder(cfg);

  return builder.bundle(buildExpression, cfg.options).then(function (output) {
    var outfile = utils.getOutFileName(output.source, cfg.bundleName + '.js', cfg.options.rev);
    writeOutput(output, outfile, cfg.baseURL, cfg.force);

    if (cfg.options.inject) {
      injectBundle(builder, output, outfile, cfg);
    }

    return _bluebird2.default.resolve();
  });
}

function writeOutput(output, outfile, baseURL, force) {
  var outPath = _path2.default.resolve(baseURL, outfile);

  if (_fs2.default.existsSync(outPath)) {
    if (!force) {
      throw new Error('A bundle named \'' + outPath + '\' already exists. Use the --force option to overwrite it.');
    }

    _fs2.default.unlinkSync(outPath);
  } else {
    var dirpath = _path2.default.dirname(outPath);

    if (!_fs2.default.existsSync(dirpath)) {
      _fs2.default.mkdirSync(dirpath);
    }
  }

  _fs2.default.writeFileSync(outPath, output.source);
}

function injectBundle(builder, output, outfile, cfg) {
  var configPath = cfg.injectionConfigPath;
  var bundleName = builder.getCanonicalName((0, _utils.toFileURL)(_path2.default.resolve(cfg.baseURL, outfile)));
  var appCfg = (0, _configSerializer.getAppConfig)(configPath);

  if (!appCfg.bundles) {
    appCfg.bundles = {};
  }

  appCfg.bundles[bundleName] = output.modules.sort();
  (0, _configSerializer.saveAppConfig)(configPath, appCfg);
}

function getFullModuleName(moduleName, map) {
  var matches = [];
  var cleanName = function cleanName(n) {
    return n.replace(/^.*:/, '').replace(/@.*$/, '');
  };

  matches = Object.keys(map).filter(function (m) {
    return m === moduleName;
  });

  if (matches.length === 1) {
    return moduleName;
  }

  matches = Object.keys(map).filter(function (m) {
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