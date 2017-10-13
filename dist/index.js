"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var bundler = require("./bundler");
var hitb = require("./html-import-template-bundler");
var utils_1 = require("./utils");
__export(require("./unbundle"));
function bundle(inpConfig) {
    var tasks = [];
    var config = utils_1.ensureDefaults(inpConfig);
    utils_1.validateConfig(config);
    Object.keys(config.bundles)
        .forEach(function (key) {
        var cfg = config.bundles[key];
        if (cfg.skip) {
            return;
        }
        if (cfg.htmlimport) {
            tasks.push(hitb.bundle(utils_1.getHtmlImportBundleConfig(cfg, key, config)));
        }
        else {
            tasks.push(bundler.bundle(utils_1.getBundleConfig(cfg, key, config)));
        }
    });
    return Promise.all(tasks);
}
exports.bundle = bundle;
function depCache(bundleConfig) {
    var tasks = [];
    var config = utils_1.ensureDefaults(bundleConfig);
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
//# sourceMappingURL=index.js.map