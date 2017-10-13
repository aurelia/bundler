"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var cheerio = require("cheerio");
var fs = require("fs");
var path = require("path");
var globby = require("globby");
var sysUtils = require("systemjs-builder/lib/utils.js");
var utils = require("./utils");
var Builder = require("systemjs-builder");
function bundle(cfg) {
    var baseURL = path.resolve(cfg.baseURL);
    var builder = new Builder(cfg.baseURL, cfg.configPath);
    builder.config(cfg.builderCfg);
    var output = generateOutput(baseURL, cfg.includes, builder);
    var outputFileName = getOutputFileName(baseURL, cfg.bundleName, output, (cfg.options && cfg.options.rev));
    if (fs.existsSync(outputFileName)) {
        if (!cfg.force) {
            throw new Error("A bundle named '" + outputFileName + "' already exists. Use the --force option to overwrite it.");
        }
        fs.unlinkSync(outputFileName);
    }
    fs.writeFileSync(outputFileName, output);
    if (cfg.options && cfg.options.inject) {
        injectLink(outputFileName, baseURL, cfg.options.inject);
    }
    return Promise.resolve();
}
exports.bundle = bundle;
function generateOutput(baseURL, includes, builder) {
    var templates = [];
    globby
        .sync(includes, {
        cwd: baseURL.replace(/\\/g, '/')
    })
        .forEach(function (file) {
        if (file !== '.') {
            file = path.resolve(baseURL, file);
            var content = fs.readFileSync(file, {
                encoding: 'utf8'
            });
            var $ = cheerio.load(content);
            var name_1 = getCanonicalName(builder, file, 'view').replace(/!view$/g, '');
            $('template').attr('id', name_1);
            var template = $.html('template');
            templates.push(template);
        }
    });
    return templates.join('\n');
}
exports.generateOutput = generateOutput;
function getOutputFileName(baseURL, bundleName, output, rev) {
    var outFileName = utils.getOutFileName(output, bundleName + '.html', rev);
    return path.resolve(baseURL, outFileName);
}
exports.getOutputFileName = getOutputFileName;
function injectLink(outfile, baseURL, inject) {
    var bundleFile = path.resolve(baseURL, path.relative(baseURL, outfile));
    var indexFile = path.resolve(baseURL, inject.indexFile);
    var destFile = path.resolve(baseURL, inject.destFile);
    var relPath = path.relative(path.dirname(indexFile), path.dirname(bundleFile)).replace(/\\/g, '/');
    var link = createLink(bundleFile, relPath);
    addLink(link, indexFile, destFile);
}
function addLink(link, indexFile, destFile) {
    var content = fs.readFileSync(indexFile, {
        encoding: 'utf8'
    });
    var $ = cheerio.load(content);
    if ($('link[aurelia-view-bundle][href="' + link + '"]').length === 0) {
        $('head').append('<link aurelia-view-bundle rel="import" href="' + link + '">');
    }
    fs.writeFileSync(destFile, $.html());
}
function createLink(bundleFile, relPath) {
    if (!relPath.startsWith('.')) {
        return relPath ? './' + relPath + '/' + path.basename(bundleFile) : './' + path.basename(bundleFile);
    }
    else {
        return relPath + '/' + path.basename(bundleFile);
    }
}
function getCanonicalName(builder, file, pluginName) {
    return builder.getCanonicalName(sysUtils.toFileURL(file) + '!' + pluginName);
}
//# sourceMappingURL=html-import-template-bundler.js.map