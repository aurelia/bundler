"use strict";
var vm = require('vm');
var fs = require('fs');
function readConfig(cfgCode) {
    var cfg = {};
    var configFunc = function (systemCfg) {
        for (var key in systemCfg) {
            if (systemCfg.hasOwnProperty(key)) {
                cfg[key] = systemCfg[key];
            }
        }
    };
    var sandbox = {
        System: {
            config: configFunc
        },
        SystemJS: {
            config: configFunc
        }
    };
    vm.createContext(sandbox);
    cfgCode.forEach(function (c) {
        vm.runInContext(c, sandbox);
    });
    return cfg;
}
exports.readConfig = readConfig;
function isSystemJS(cfgCode) {
    var res = false;
    var sandbox = {
        SystemJS: {
            config: function () {
                res = true;
            }
        },
        System: {
            config: function () {
                res = false;
            }
        }
    };
    vm.createContext(sandbox);
    vm.runInContext(cfgCode, sandbox);
    return res;
}
exports.isSystemJS = isSystemJS;
function isSystem(cfgCode) {
    var res = false;
    var sandbox = {
        System: {
            config: function () {
                res = true;
            }
        },
        SystemJS: {
            config: function () {
                res = false;
            }
        }
    };
    vm.createContext(sandbox);
    vm.runInContext(cfgCode, sandbox);
    return res;
}
exports.isSystem = isSystem;
function serializeConfig(config, isSystemJS) {
    var tab = '  ';
    var json = JSON.stringify(config, null, 2)
        .replace(new RegExp('^' + tab + '"(\\w+)"', 'mg'), tab + '$1');
    if (isSystemJS) {
        return "SystemJS.config(" + json + ");";
    }
    return "System.config(" + json + ");";
}
exports.serializeConfig = serializeConfig;
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
exports.getAppConfig = getAppConfig;
function saveAppConfig(configPath, config) {
    fs.writeFileSync(configPath, serializeConfig(config, isSystemJS(fs.readFileSync(configPath, 'utf8'))));
}
exports.saveAppConfig = saveAppConfig;
