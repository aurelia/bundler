"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var Promise = require("bluebird");
var bundler = require("./bundler");
var hitb = require("./html-import-template-bundler");
var utils_1 = require("./utils");
__export(require("./unbundle"));
function bundle(bundleConfig) {
    var tasks = [];
    var commonCfg = utils_1.getCommonConfig(bundleConfig);
    utils_1.validateConfig(commonCfg);
    var bundles = commonCfg.bundles;
    Object.keys(bundles)
        .forEach(function (key) {
        var cfg = bundles[key];
        if (cfg.skip) {
            return;
        }
        if (cfg.htmlimport) {
            tasks.push(_bundleHtmlImportTemplate(cfg, key, commonCfg));
        }
        else {
            tasks.push(_bundle(cfg, key, commonCfg));
        }
    });
    return Promise.all(tasks);
}
exports.bundle = bundle;
function depCache(bundleConfig) {
    var tasks = [];
    var config = utils_1.getCommonConfig(bundleConfig);
    utils_1.validateConfig(config);
    var bundles = config.bundles;
    Object.keys(bundles)
        .forEach(function (key) {
        var cfg = bundles[key];
        if (cfg.skip) {
            return;
        }
        if (cfg.htmlimport) {
            return;
        }
        tasks.push(bundler.depCache(utils_1.getBundleConfig(cfg, key, config)));
    });
    return Promise.all(tasks);
}
exports.depCache = depCache;
function _bundle(bundleCfg, bundleName, config) {
    return bundler.bundle(utils_1.getBundleConfig(bundleCfg, bundleName, config));
}
function _bundleHtmlImportTemplate(bundleOpts, bundleName, config) {
    return hitb.bundle(utils_1.getHtmlImportBundleConfig(bundleOpts, bundleName, config));
}
