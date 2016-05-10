'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bundle = bundle;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _whacko = require('whacko');

var _whacko2 = _interopRequireDefault(_whacko);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _utils = require('systemjs-builder/lib/utils');

var _utils2 = _interopRequireDefault(_utils);

var _systemjsBuilder = require('systemjs-builder');

var _systemjsBuilder2 = _interopRequireDefault(_systemjsBuilder);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bundle(cfg) {
  var builder = new _systemjsBuilder2.default(cfg.baseURL, cfg.configPath);
  builder.config(cfg.builderCfg);

  var templates = [];
  var baseURL = _path2.default.resolve(cfg.baseURL);
  var outfile = _path2.default.resolve(baseURL, cfg.bundleName) + '.html';

  if (_fs2.default.existsSync(outfile)) {
    if (!cfg.force) {
      throw new Error('A bundle named \'' + outfile + '\' already exists. Use the --force option to overwrite it.');
    }
    _fs2.default.unlinkSync(outfile);
  }

  _globby2.default.sync(cfg.includes, {
    cwd: baseURL.replace(/\\/g, '/')
  }).forEach(function (file) {
    if (file != '.') {
      file = _path2.default.resolve(baseURL, file);
      var content = _fs2.default.readFileSync(file, {
        encoding: 'utf8'
      });

      var $ = _whacko2.default.load(content);
      var name = getCanonicalName(builder, file, 'view').replace(/!view$/g, '');

      $('template').attr('id', name);
      var template = $.html('template');
      templates.push(template);
    }
  });

  _fs2.default.writeFileSync(outfile, templates.join('\n'));

  if (cfg.options.inject) {
    injectLink(outfile, baseURL, cfg.options.inject);
  }

  return _bluebird2.default.resolve();
}

function injectLink(outfile, baseURL, inject) {
  var bundleFile = _path2.default.resolve(baseURL, _path2.default.relative(baseURL, outfile));
  var indexFile = _path2.default.resolve(baseURL, inject.indexFile);
  var destFile = _path2.default.resolve(baseURL, inject.destFile);
  var relpath = _path2.default.relative(_path2.default.dirname(indexFile), _path2.default.dirname(bundleFile)).replace(/\\/g, '/');

  var link = createLink(bundleFile, relpath);
  addLink(link, indexFile, destFile);
}

function addLink(link, indexFile, destFile) {
  var content = _fs2.default.readFileSync(indexFile, {
    encoding: 'utf8'
  });

  var $ = _whacko2.default.load(content);

  if ($('link[aurelia-view-bundle][href="' + link + '"]').length === 0) {
    $('head').append('<link aurelia-view-bundle rel="import" href="' + link + '">');
  }

  _fs2.default.writeFileSync(destFile, $.html());
}

function createLink(bundleFile, relpath) {
  if (!relpath.startsWith('.')) {
    return relpath ? './' + relpath + '/' + _path2.default.basename(bundleFile) : './' + _path2.default.basename(bundleFile);
  } else {
    return relpath + '/' + _path2.default.basename(bundleFile);
  }
}

function getCanonicalName(builder, file, pluginName) {
  return builder.getCanonicalName(_utils2.default.toFileURL(file) + '!' + pluginName);
}