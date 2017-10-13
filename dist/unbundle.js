"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var cheerio = require("cheerio");
var fs = require("fs");
var path = require("path");
var config_serializer_1 = require("./config-serializer");
var utils_1 = require("./utils");
function unbundle(cfg) {
    var config = utils_1.ensureDefaults(cfg);
    utils_1.validateConfig(config);
    var tasks = [
        removeBundles(config),
        removeHtmlImportBundles(config)
    ];
    return Promise.all(tasks);
}
exports.unbundle = unbundle;
function removeBundles(cfg) {
    var configPath = cfg.injectionConfigPath;
    var appCfg = config_serializer_1.getAppConfig(configPath);
    delete appCfg.bundles;
    delete appCfg.depCache;
    config_serializer_1.saveAppConfig(configPath, appCfg);
    return Promise.resolve();
}
function removeHtmlImportBundles(config) {
    var tasks = [];
    Object
        .keys(config.bundles)
        .forEach(function (key) {
        var cfg = config.bundles[key];
        if (cfg.htmlimport) {
            tasks.push(_removeHtmlImportBundle(utils_1.getHtmlImportBundleConfig(cfg, key, config)));
        }
    });
    return Promise.all(tasks);
}
function _removeHtmlImportBundle(cfg) {
    var inject = cfg.options.inject;
    var file = path.resolve(cfg.baseURL, inject.destFile);
    if (!fs.existsSync(file)) {
        return Promise.resolve();
    }
    return Promise
        .promisify(fs.readFile)(file, {
        encoding: 'utf8'
    })
        .then(function (content) {
        var $ = cheerio.load(content);
        return Promise.resolve($);
    })
        .then(function ($) {
        return removeLinkInjections($);
    })
        .then(function ($) {
        return Promise.promisify(fs.writeFile)(file, $.html());
    });
}
function removeLinkInjections($) {
    $('link[aurelia-view-bundle]').remove();
    return Promise.resolve($);
}
//# sourceMappingURL=unbundle.js.map