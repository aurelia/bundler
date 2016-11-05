"use strict";
var fs = require('fs');
var bluebird_1 = require('bluebird');
var sysUtil = require('systemjs-builder/lib/utils.js');
var systemjs_builder_1 = require('systemjs-builder');
var path = require('path');
var lodash_1 = require('lodash');
var config_serializer_1 = require('./config-serializer');
var utils = require('./utils');
var html_minifier_1 = require('html-minifier');
var clean_css_1 = require('clean-css');
function createBuildExpression(cfg) {
    var appCfg = config_serializer_1.getAppConfig(cfg.configPath);
    var includeExpression = cfg.includes.map(function (m) { return getFullModuleName(m, appCfg.map); }).join(' + ');
    var excludeExpression = cfg.excludes.map(function (m) { return getFullModuleName(m, appCfg.map); }).join(' - ');
    var buildExpression = includeExpression;
    if (excludeExpression && excludeExpression.length > 0) {
        buildExpression = buildExpression + " - " + excludeExpression;
    }
    return buildExpression;
}
function createFetchHook(cfg) {
    return function (load, fetch) {
        var address = sysUtil.fromFileURL(load.address);
        var ext = path.extname(address);
        if (!(ext === '.html' || ext === '.css')) {
            return fetch(load);
        }
        var plugin = path.basename(sysUtil.fromFileURL(load.name.split('!')[1]));
        if (!plugin.startsWith('plugin-text')) {
            return fetch(load);
        }
        if (ext === '.html' && cfg.options.minify) {
            var content = fs.readFileSync(address, 'utf8');
            var opts = utils.getHTMLMinOpts(cfg.options.htmlminopts);
            return html_minifier_1.default.minify(content, opts);
        }
        if (ext === '.css' && cfg.options.minify) {
            var content = fs.readFileSync(address, 'utf8');
            var opts = utils.getCSSMinOpts(cfg.options.cssminopts);
            var output = new clean_css_1.default(opts).minify(content);
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
    var tasks = [
        _bundle(buildExpression, cfg)
    ];
    if (cfg.options.depCache) {
        tasks.push(_depCache(buildExpression, cfg));
    }
    return bluebird_1.Promise.all(tasks);
}
exports.bundle = bundle;
function depCache(cfg) {
    var buildExpression = createBuildExpression(cfg);
    return _depCache(buildExpression, cfg);
}
exports.depCache = depCache;
function createBuilder(cfg) {
    var builder = new systemjs_builder_1.default(cfg.baseURL);
    var appCfg = config_serializer_1.getAppConfig(cfg.configPath);
    delete appCfg.baseURL;
    builder.config(appCfg);
    builder.config(cfg.builderCfg);
    return builder;
}
function _depCache(buildExpression, cfg) {
    var builder = createBuilder(cfg);
    return builder.trace(buildExpression, cfg.options)
        .then(function (tree) {
        var depCache = builder.getDepCache(tree);
        var configPath = cfg.injectionConfigPath;
        var appCfg = config_serializer_1.getAppConfig(configPath);
        var dc = appCfg.depCache || {};
        lodash_1.default.assign(dc, depCache);
        appCfg.depCache = dc;
        config_serializer_1.saveAppConfig(configPath, appCfg);
        return bluebird_1.Promise.resolve();
    });
}
function _bundle(buildExpression, cfg) {
    var builder = createBuilder(cfg);
    return builder.bundle(buildExpression, cfg.options)
        .then(function (output) {
        var outfile = utils.getOutFileName(output.source, cfg.bundleName + '.js', cfg.options.rev);
        writeOutput(output, outfile, cfg.baseURL, cfg.force, cfg.options.sourceMaps);
        if (cfg.options.sourceMaps) {
            writeSourcemaps(output, outfile, cfg.baseURL, cfg.force);
        }
        if (cfg.options.inject) {
            injectBundle(builder, output, outfile, cfg);
        }
        return bluebird_1.Promise.resolve();
    });
}
function writeSourcemaps(output, outfile, baseURL, force) {
    var outPath = path.resolve(baseURL, outfile) + '.map';
    if (fs.existsSync(outPath)) {
        if (!force) {
            throw new Error("A source map named '" + outPath + "' already exists. Use the --force option to overwrite it.");
        }
        fs.unlinkSync(outPath);
    }
    else {
        var dirPath = path.dirname(outPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    }
    fs.writeFileSync(outPath, output.sourceMap);
}
exports.writeSourcemaps = writeSourcemaps;
function writeOutput(output, outfile, baseURL, force, sourceMaps) {
    var outPath = path.resolve(baseURL, outfile);
    if (fs.existsSync(outPath)) {
        if (!force) {
            throw new Error("A bundle named '" + outPath + "' already exists. Use the --force option to overwrite it.");
        }
        fs.unlinkSync(outPath);
    }
    else {
        var dirPath = path.dirname(outPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    }
    var source = output.source;
    if (sourceMaps) {
        var sourceMapFileName = path.basename(outPath) + '.map';
        source += '\n//# sourceMappingURL=' + sourceMapFileName;
    }
    fs.writeFileSync(outPath, source);
}
exports.writeOutput = writeOutput;
function injectBundle(builder, output, outfile, cfg) {
    var configPath = cfg.injectionConfigPath;
    var bundleName = builder.getCanonicalName(sysUtil.toFileURL(path.resolve(cfg.baseURL, outfile)));
    var appCfg = config_serializer_1.getAppConfig(configPath);
    if (!appCfg.bundles) {
        appCfg.bundles = {};
    }
    appCfg.bundles[bundleName] = output.modules.sort();
    config_serializer_1.saveAppConfig(configPath, appCfg);
}
exports.injectBundle = injectBundle;
function getFullModuleName(moduleName, map) {
    var cleanName = function (n) { return n.replace(/^.*:/, '').replace(/@.*$/, ''); };
    var matches = Object.keys(map).filter(function (m) { return m === moduleName; });
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
    throw new Error("A version conflict was found among the module \nnames specified in the configuration for '" + moduleName + "'. Try including a full module name with a specific ver\nsion number or resolve the conflict manually with jspm.");
}
exports.getFullModuleName = getFullModuleName;
