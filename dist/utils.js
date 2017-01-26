"use strict";
var _ = require("lodash");
var revPath = require("rev-path");
var revHash = require("rev-hash");
var fs = require("fs");
var path = require("path");
function getOutFileName(source, fileName, rev) {
    return rev ? revPath(fileName, revHash(new Buffer(source, 'utf-8'))) : fileName;
}
exports.getOutFileName = getOutFileName;
function validateConfig(config) {
    if (!fs.existsSync(config.baseURL)) {
        throw new Error("Path '" + path.resolve(config.baseURL) + "' does not exist. Please provide a valid 'baseURL' in your bundle configuration.");
    }
    var configPaths = [];
    var configPath = config.configPath;
    if (typeof configPath === 'string') {
        configPaths.push(configPath);
    }
    else {
        configPath.forEach(function (p) { return configPaths.push(p); });
    }
    configPaths.forEach(function (p) {
        if (!fs.existsSync(p)) {
            throw new Error("File '" + path.resolve(p) + "' was not found! Please provide a valid 'config.js' file for use during bundling.");
        }
    });
}
exports.validateConfig = validateConfig;
function getHTMLMinOpts(opts) {
    return _.defaultsDeep(opts, {
        caseSensitive: true,
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeCDATASectionsFromCDATA: true,
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: false,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
    });
}
exports.getHTMLMinOpts = getHTMLMinOpts;
function getCSSMinOpts(opts) {
    return _.defaultsDeep(opts, {
        advanced: true,
        agressiveMerging: true,
        mediaMerging: true,
        restructuring: true,
        shorthandCompacting: true,
    });
}
exports.getCSSMinOpts = getCSSMinOpts;
function getBundleConfig(bundleCfg, bundleName, config) {
    return _.defaultsDeep(bundleCfg, {
        baseURL: config.baseURL,
        builderCfg: config.builderCfg,
        bundleName: bundleName,
        configPath: config.configPath,
        excludes: [],
        includes: [],
        outputPath: config.outputPath,
        injectionConfigPath: config.injectionConfigPath,
        force: config.force,
        options: {
            depCache: false,
            cssminopts: {},
            htmlminopts: {},
            inject: true,
            minify: false,
            rev: false,
        },
    });
}
exports.getBundleConfig = getBundleConfig;
function getHtmlImportBundleConfig(bundleCfg, bundleName, config) {
    var cfg = _.defaultsDeep(bundleCfg, {
        htmlimport: true,
        includes: '*.html',
        bundleName: bundleName,
        options: {
            inject: false
        },
        force: config.force,
        baseURL: config.baseURL,
        configPath: config.configPath,
        builderCfg: config.builderCfg
    });
    if (!cfg.options.inject) {
        return cfg;
    }
    if (typeof cfg.options.inject === 'boolean') {
        cfg.options.inject = {
            indexFile: 'index.html',
            destFile: 'index.html'
        };
    }
    else {
        cfg.options.inject.indexFile = cfg.options.inject.indexFile || 'index.html';
        cfg.options.inject.destFile = cfg.options.inject.destFile || 'index.html';
    }
    return cfg;
}
exports.getHtmlImportBundleConfig = getHtmlImportBundleConfig;
function ensureDefaults(config) {
    return _.defaults(config, {
        baseURL: '.',
        builderCfg: {},
        bundles: {},
        configPath: './config.js',
        force: false,
        injectionConfigPath: getDefaultInjectionConfigFilePath(config.configPath),
    });
}
exports.ensureDefaults = ensureDefaults;
function getDefaultInjectionConfigFilePath(configPath) {
    if (typeof configPath === 'string') {
        return configPath;
    }
    if (Array.isArray(configPath)) {
        return configPath[0];
    }
    throw new Error('No bundle injection config file path provided. Set `injectionConfigPath` property in the bundle config.');
}
//# sourceMappingURL=utils.js.map