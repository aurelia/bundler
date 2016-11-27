import * as fs from 'fs';
import * as Promise from 'bluebird';
import * as sysUtil  from 'systemjs-builder/lib/utils.js';
import * as Builder from 'systemjs-builder';
import * as path from 'path';
import * as _ from 'lodash';
import * as utils from './utils';
import {getAppConfig, saveAppConfig} from './config-serializer';
import * as htmlminifier from 'html-minifier';
import * as CleanCSS from 'clean-css';

function createBuildExpression(cfg): string {
  let appCfg = getAppConfig(cfg.configPath);
  let includeExpression = cfg.includes.map(m => getFullModuleName(m, appCfg.map)).join(' + ');
  let excludeExpression = cfg.excludes.map(m => getFullModuleName(m, appCfg.map)).join(' - ');
  let buildExpression = includeExpression;

  if (excludeExpression && excludeExpression.length > 0) {
    buildExpression = `${buildExpression} - ${excludeExpression}`;
  }
  return buildExpression;
}

function createFetchHook(cfg) {
  return (load, fetch) => {
    let address = sysUtil.fromFileURL(load.address);
    let ext = path.extname(address);

    if (!(ext === '.html' || ext === '.css')) {
      return fetch(load);
    }

    let plugin = path.basename(sysUtil.fromFileURL(load.name.split('!')[1]));

    if (!plugin.startsWith('plugin-text')) {
      return fetch(load);
    }

    if (ext === '.html' && cfg.options.minify) {
      let content = fs.readFileSync(address, 'utf8');
      let opts = utils.getHTMLMinOpts(cfg.options.htmlminopts);

      return htmlminifier.minify(content, opts);
    }

    if (ext === '.css' && cfg.options.minify) {
      let content = fs.readFileSync(address, 'utf8');
      let opts = utils.getCSSMinOpts(cfg.options.cssminopts);

      let output = new CleanCSS(opts).minify(content);

      if (output.errors.length) {
        throw new Error('CSS Plugin:\n' + output.errors.join('\n'));
      }

      return output.styles;
    }

    return fetch(load);
  };
}

export function bundle(cfg) {
  let buildExpression = createBuildExpression(cfg);
  cfg.options.fetch = createFetchHook(cfg);

  let tasks = [
    _bundle(buildExpression, cfg)
  ];

  if (cfg.options.depCache) {
    tasks.push(_depCache(buildExpression, cfg));
  }

  return Promise.all<void>(tasks);
}

export function depCache(cfg) {
  let buildExpression = createBuildExpression(cfg);
  return _depCache(buildExpression, cfg);
}

function createBuilder(cfg) {
  let builder = new Builder(cfg.baseURL);
  let appCfg = getAppConfig(cfg.configPath);
  delete appCfg.baseURL;

  builder.config(appCfg);
  builder.config(cfg.builderCfg);
  return builder;
}

function _depCache(buildExpression, cfg) {
  let builder = createBuilder(cfg);
  return builder.trace(buildExpression, cfg.options)
    .then(tree => {
      let depCache = builder.getDepCache(tree);
      let configPath = cfg.injectionConfigPath;
      let appCfg = getAppConfig(configPath);
      let dc = appCfg.depCache || {};

      _.assign(dc, depCache);
      appCfg.depCache = dc;

      saveAppConfig(configPath, appCfg);

      return Promise.resolve();
    });
}

function _bundle(buildExpression: string, cfg: any) {
  let builder = createBuilder(cfg);

  return builder.bundle(buildExpression, cfg.options)
    .then((output) => {
      let outfile = utils.getOutFileName(output.source, cfg.bundleName + '.js', cfg.options.rev);
      writeOutput(output, outfile, cfg.baseURL, cfg.force, cfg.options.sourceMaps);
      if (cfg.options.sourceMaps) {
        writeSourcemaps(output, outfile, cfg.baseURL, cfg.force);
      }
      if (cfg.options.inject) {
        injectBundle(builder, output, outfile, cfg);
      }
      return Promise.resolve();
    });
}

export function writeSourcemaps(output, outfile, baseURL, force) {
  let outPath = path.resolve(baseURL, outfile) + '.map';

  if (fs.existsSync(outPath)) {
    if (!force) {
      throw new Error(`A source map named '${outPath}' already exists. Use the --force option to overwrite it.`);
    }

    fs.unlinkSync(outPath);
  } else {
    let dirPath = path.dirname(outPath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  }
  fs.writeFileSync(outPath, output.sourceMap);
}

export function writeOutput(output, outfile, baseURL, force, sourceMaps) {
  let outPath = path.resolve(baseURL, outfile);

  if (fs.existsSync(outPath)) {
    if (!force) {
      throw new Error(`A bundle named '${outPath}' already exists. Use the --force option to overwrite it.`);
    }

    fs.unlinkSync(outPath);
  } else {
    let dirPath = path.dirname(outPath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  }
  let source = output.source;
  if (sourceMaps) {
    let sourceMapFileName = path.basename(outPath) + '.map';
    source += '\n//# sourceMappingURL=' + sourceMapFileName;
  }
  fs.writeFileSync(outPath, source);
}

export function injectBundle(builder, output, outfile, cfg) {
  let configPath = cfg.injectionConfigPath;
  let bundleName = builder.getCanonicalName(sysUtil.toFileURL(path.resolve(cfg.baseURL, outfile)));
  let appCfg = getAppConfig(configPath);

  if (!appCfg.bundles) {
    appCfg.bundles = {};
  }

  appCfg.bundles[bundleName] = output.modules.sort();
  saveAppConfig(configPath, appCfg);
}

export function getFullModuleName(moduleName, map) {
  let cleanName = n => n.replace(/^.*:/, '').replace(/@.*$/, '');
  let matches = Object.keys(map).filter(m => m === moduleName);

  if (matches.length === 1) {
    return moduleName;
  }

  matches = Object.keys(map).filter(m => {
    return cleanName(m) === cleanName(moduleName);
  });

  if (matches.length === 1) {
    return matches[0];
  }

  if (matches.length === 0) {
    return moduleName;
  }

  throw new Error(`A version conflict was found among the module names specified \
  in the configuration for '${moduleName}'. Try including a full module name with a specific version \
  number or resolve the conflict manually with jspm.`);
}
