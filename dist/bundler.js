"use strict";
var fs = require("fs");
var Promise = require("bluebird");
var sysUtil = require("systemjs-builder/lib/utils.js");
var path = require("path");
var _ = require("lodash");
var utils = require("./utils");
var serializer = require("./config-serializer");
var htmlminifier = require("html-minifier");
var CleanCSS = require("clean-css");
var builder_factory_1 = require("./builder-factory");
var mkdirp = require("mkdirp");
function createBuildExpression(cfg) {
    var appCfg = serializer.getAppConfig(cfg.configPath);
    var includes = cfg.includes;
    var excludes = cfg.excludes;
    var includeExpression = includes.map(function (m) { return getFullModuleName(m, appCfg.map); }).join(' + ');
    var excludeExpression = excludes.map(function (m) { return getFullModuleName(m, appCfg.map); }).join(' - ');
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
            return htmlminifier.minify(content, opts);
        }
        if (ext === '.css' && cfg.options.minify) {
            var content = fs.readFileSync(address, 'utf8');
            var opts = utils.getCSSMinOpts(cfg.options.cssminopts);
            var output = new CleanCSS(opts).minify(content);
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
    return Promise.all(tasks);
}
exports.bundle = bundle;
function depCache(cfg) {
    var buildExpression = createBuildExpression(cfg);
    return _depCache(buildExpression, cfg);
}
exports.depCache = depCache;
function _depCache(buildExpression, cfg) {
    var builder = builder_factory_1.createBuilder(cfg);
    return builder.trace(buildExpression, cfg.options)
        .then(function (tree) {
        var depCache = builder.getDepCache(tree);
        var configPath = cfg.injectionConfigPath;
        var appCfg = serializer.getAppConfig(configPath);
        var dc = appCfg.depCache || {};
        _.assign(dc, depCache);
        appCfg.depCache = dc;
        serializer.saveAppConfig(configPath, appCfg);
        return Promise.resolve();
    });
}
function _bundle(buildExpression, cfg) {
    var builder = builder_factory_1.createBuilder(cfg);
    return builder.bundle(buildExpression, cfg.options)
        .then(function (output) {
        var outfile = utils.getOutFileName(output.source, cfg.bundleName + '.js', cfg.options.rev);
        var outPath = createOutputPath(cfg.baseURL, outfile, cfg.outputPath);
        writeOutput(output, outPath, cfg.force, cfg.options.sourceMaps);
        if (cfg.options.sourceMaps) {
            writeSourcemaps(output, outPath + ".map", cfg.force);
        }
        if (cfg.options.inject) {
            injectBundle(builder, output, outfile, cfg);
        }
        return Promise.resolve();
    });
}
function createOutputPath(baseURL, outfile, outputPath) {
    return outputPath ? path.resolve(outputPath, path.basename(outfile)) : path.resolve(baseURL, outfile);
}
function writeSourcemaps(output, outPath, force) {
    if (fs.existsSync(outPath)) {
        if (!force) {
            throw new Error("A source map named '" + outPath + "' already exists. Use the --force option to overwrite it.");
        }
        fs.unlinkSync(outPath);
    }
    else {
        var dirPath = path.dirname(outPath);
        if (!fs.existsSync(dirPath)) {
            mkdirp.sync(dirPath);
        }
    }
    fs.writeFileSync(outPath, output.sourceMap);
}
exports.writeSourcemaps = writeSourcemaps;
function writeOutput(output, outPath, force, sourceMap) {
    if (fs.existsSync(outPath)) {
        if (!force) {
            throw new Error("A bundle named '" + outPath + "' already exists. Use the --force option to overwrite it.");
        }
        fs.unlinkSync(outPath);
    }
    else {
        var dirPath = path.dirname(outPath);
        if (!fs.existsSync(dirPath)) {
            mkdirp.sync(dirPath);
        }
    }
    var source = output.source;
    if (sourceMap) {
        var sourceMapFileName = path.basename(outPath) + '.map';
        source += '\n//# sourceMappingURL=' + sourceMapFileName;
    }
    fs.writeFileSync(outPath, source);
}
exports.writeOutput = writeOutput;
function injectBundle(builder, output, outfile, cfg) {
    var configPath = cfg.injectionConfigPath;
    var bundleName = builder.getCanonicalName(sysUtil.toFileURL(path.resolve(cfg.baseURL, outfile)));
    var appCfg = serializer.getAppConfig(configPath);
    if (!appCfg.bundles) {
        appCfg.bundles = {};
    }
    appCfg.bundles[bundleName] = output.modules.sort();
    serializer.saveAppConfig(configPath, appCfg);
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
    throw new Error("A version conflict was found among the module names specified   in the configuration for '" + moduleName + "'. Try including a full module name with a specific version   number or resolve the conflict manually with jspm.");
}
exports.getFullModuleName = getFullModuleName;
//# sourceMappingURL=bundler.js.map