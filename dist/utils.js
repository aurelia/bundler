"use strict";
var lodash_1 = require('lodash');
var rev_path_1 = require('rev-path');
var rev_hash_1 = require('rev-hash');
var fs = require('fs');
var path_1 = require('path');
function getOutFileName(source, fileName, rev) {
    return rev ? rev_path_1.default(fileName, rev_hash_1.default(new Buffer(source, 'utf-8'))) : fileName;
}
exports.getOutFileName = getOutFileName;
function validateConfig(config) {
    if (!fs.existsSync(config.baseURL)) {
        throw new Error("Path '" + path_1.default.resolve(config.baseURL) + "' does not exist. Please provide a valid 'baseURL' in your bundle configuration.");
    }
    var configPaths = [];
    if (typeof config.configPath === 'string') {
        configPaths.push(config.configPath);
    }
    if (Array.isArray(config.configPath)) {
        config.configPath.forEach(function (p) { return configPaths.push(p); });
    }
    configPaths.forEach(function (p) {
        if (!fs.existsSync(p)) {
            throw new Error("File '" + path_1.default.resolve(p) + "' was not found! Please provide a valid 'config.js' file for use during bundling.");
        }
    });
}
exports.validateConfig = validateConfig;
function getHTMLMinOpts(opts) {
    return lodash_1.default.defaultsDeep(opts, {
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
    return lodash_1.default.defaultsDeep(opts, {
        advanced: true,
        agressiveMerging: true,
        mediaMerging: true,
        restructuring: true,
        shorthandCompacting: true,
    });
}
exports.getCSSMinOpts = getCSSMinOpts;
function getBundleConfig(bundleCfg, bundleName, config) {
    return lodash_1.default.defaultsDeep(bundleCfg, {
        baseURL: config.baseURL,
        builderCfg: config.builderCfg,
        bundleName: bundleName,
        configPath: config.configPath,
        excludes: [],
        includes: [],
        injectionConfigPath: config.injectionConfigPath,
        force: config.force,
        options: {
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
    var cfg = lodash_1.default.defaultsDeep(bundleCfg, {
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
    if (cfg.options.inject) {
        if (!lodash_1.default.isObject(cfg.options.inject)) {
            cfg.options.inject = {
                indexFile: 'index.html',
                destFile: 'index.html'
            };
        }
        else {
            cfg.options.inject.indexFile = cfg.options.inject.indexFile || 'index.html';
            cfg.options.inject.destFile = cfg.options.inject.destFile || 'index.html';
        }
    }
    return cfg;
}
exports.getHtmlImportBundleConfig = getHtmlImportBundleConfig;
function getCommonConfig(config) {
    return lodash_1.default.defaults(config, {
        baseURL: '.',
        builderCfg: {},
        bundles: {},
        configPath: './config.js',
        force: false,
        injectionConfigPath: getDefaultInjectionConfigFilePath(config.configPath),
    });
}
exports.getCommonConfig = getCommonConfig;
function getDefaultInjectionConfigFilePath(configPath) {
    if (typeof configPath === 'string') {
        return configPath;
    }
    if (Array.isArray(configPath)) {
        return configPath[0];
    }
    throw new Error('No bundle injection config file path provided. Set `injectionConfigPath` property in the bundle config.');
}
