"use strict";
var bluebird_1 = require('bluebird');
var whacko_1 = require('whacko');
var fs = require('fs');
var path = require('path');
var config_serializer_1 = require('./config-serializer');
var utils_1 = require('./utils');
function unbundle(cfg) {
    var config = utils_1.getCommonConfig(cfg);
    utils_1.validateConfig(config);
    var tasks = [
        removeBundles(config),
        removeHtmlImportBundles(config)
    ];
    return bluebird_1.Promise.all(tasks);
}
exports.unbundle = unbundle;
function removeBundles(cfg) {
    var configPath = cfg.injectionConfigPath;
    var appCfg = config_serializer_1.getAppConfig(configPath);
    delete appCfg.bundles;
    delete appCfg.depCache;
    config_serializer_1.saveAppConfig(configPath, appCfg);
    return bluebird_1.Promise.resolve();
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
    return bluebird_1.Promise.all(tasks);
}
function _removeHtmlImportBundle(cfg) {
    var file = path.resolve(cfg.baseURL, cfg.options.inject.destFile);
    if (!fs.existsSync(file)) {
        return bluebird_1.Promise.resolve();
    }
    return bluebird_1.Promise
        .promisify(fs.readFile)(file, {
        encoding: 'utf8'
    })
        .then(function (content) {
        var $ = whacko_1.default.load(content);
        return bluebird_1.Promise.resolve($);
    })
        .then(function ($) {
        return removeLinkInjections($);
    })
        .then(function ($) {
        return bluebird_1.Promise.promisify(fs.writeFile)(file, $.html());
    });
}
function removeLinkInjections($) {
    $('link[aurelia-view-bundle]').remove();
    return bluebird_1.Promise.resolve($);
}
