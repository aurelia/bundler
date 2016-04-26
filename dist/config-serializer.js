'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.readConfig = readConfig;
exports.serializeConfig = serializeConfig;
exports.getAppConfig = getAppConfig;
exports.saveAppConfig = saveAppConfig;
var vm = require('vm');
var fs = require('fs');

function readConfig(cfgCode) {
  var cfg = {};
  var sandbox = {};
  var configFunc = function configFunc(_cfg) {
    for (var key in _cfg) {
      cfg[key] = _cfg[key];
    }
  };

  sandbox.System = {
    config: configFunc
  };

  sandbox.SystemJS = {
    config: configFunc
  };

  vm.createContext(sandbox);

  cfgCode.forEach(function (c) {
    vm.runInContext(c, sandbox);
  });

  return cfg;
}

function serializeConfig(config) {
  var tab = '  ';
  var json = JSON.stringify(config, null, 2).replace(new RegExp('^' + tab + '"(\\w+)"', 'mg'), tab + '$1');

  return 'System.config(' + json + ');';
}

function getAppConfig(configPath) {
  var configCode = [];

  if (typeof configPath === 'string') {
    configCode.push(fs.readFileSync(configPath, 'utf8'));
  }

  if (Array.isArray(configPath)) {
    configPath.forEach(function (cp) {
      configCode.push(fs.readFileSync(cp, 'utf8'));
    });
  }

  var appCfg = readConfig(configCode);

  if (!appCfg.map) {
    appCfg.map = {};
  }
  return appCfg;
}

function saveAppConfig(configPath, config) {
  fs.writeFileSync(configPath, serializeConfig(config));
}