import * as fs from 'fs';
import * as Promise from 'bluebird';
import * as sysUtil from 'systemjs-builder/lib/utils.js';
import * as Builder from 'systemjs-builder';
import * as path from 'path';
import * as _ from 'lodash';
import * as utils from './utils';
import * as serializer from './config-serializer';
import * as htmlminifier from 'html-minifier';
import * as CleanCSS from 'clean-css';
import { createBuilder } from './builder-factory';
import { BundleConfig, FetchHook } from "./models";
import * as mkdirp from 'mkdirp';

function createBuildExpression(cfg: BundleConfig) {
  let appCfg = serializer.getAppConfig(cfg.configPath);
  let includes = cfg.includes as string[];
  let excludes = cfg.excludes;

  let includeExpression = includes.map(m => getFullModuleName(m, appCfg.map)).join(' + ');
  let excludeExpression = excludes.map(m => getFullModuleName(m, appCfg.map)).join(' - ');
  let buildExpression = includeExpression;

  if (excludeExpression && excludeExpression.length > 0) {
    buildExpression = `${buildExpression} - ${excludeExpression}`;
  }

  return buildExpression;
}

function createFetchHook(cfg: BundleConfig): FetchHook {
  return (load: any, fetch: (load: any) => any): string | any => {
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

export function bundle(cfg: BundleConfig) {
  let buildExpression = createBuildExpression(cfg);
  cfg.options.fetch = createFetchHook(cfg);

  let tasks = [
    _bundle(buildExpression, cfg)
  ];

  if (cfg.options.depCache) {
    tasks.push(_depCache(buildExpression, cfg));
  }

  return Promise.all<any>(tasks);
}

export function depCache(cfg: BundleConfig): Promise<any> {
  let buildExpression = createBuildExpression(cfg);
  return _depCache(buildExpression, cfg);
}

function _depCache(buildExpression: string, cfg: BundleConfig) {
  let builder = createBuilder(cfg);
  return builder.trace(buildExpression, cfg.options)
    .then(tree => {
      let depCache = builder.getDepCache(tree);
      let configPath = cfg.injectionConfigPath as string;
      let appCfg = serializer.getAppConfig(configPath);
      let dc = appCfg.depCache || {};

      _.assign(dc, depCache);
      appCfg.depCache = dc;
      serializer.saveAppConfig(configPath, appCfg);
      return Promise.resolve();
    });
}

function _bundle(buildExpression: string, cfg: BundleConfig) {
  let builder = createBuilder(cfg);
  return builder.bundle(buildExpression, cfg.options)
    .then((output) => {
      let outfile = utils.getOutFileName(output.source, cfg.bundleName + '.js', cfg.options.rev as boolean);
      let outPath = createOutputPath(cfg.baseURL, outfile, cfg.outputPath);
      writeOutput(output, outPath, cfg.force as boolean, cfg.options.sourceMaps);

      if (cfg.options.sourceMaps && cfg.options.sourceMaps !== 'inline') {
        writeSourcemaps(output, `${outPath}.map`, cfg.force as boolean);
      }

      if (cfg.options.inject) {
        injectBundle(builder, output, outfile, cfg);
      }
      return Promise.resolve();
    });
}

function createOutputPath(baseURL: string, outfile: string, outputPath?: string) {
  return outputPath ? path.resolve(outputPath, path.basename(outfile)) : path.resolve(baseURL, outfile);
}

export function writeSourcemaps(output: Builder.Output, outPath: string, force: boolean) {
  if (fs.existsSync(outPath)) {
    if (!force) {
      throw new Error(`A source map named '${outPath}' already exists. Use the --force option to overwrite it.`);
    }
    fs.unlinkSync(outPath);
  } else {
    let dirPath = path.dirname(outPath);
    if (!fs.existsSync(dirPath)) {
      mkdirp.sync(dirPath);
    }
  }
  fs.writeFileSync(outPath, output.sourceMap);
}

export function writeOutput(output: Builder.Output, outPath: string, force: boolean, sourceMap: boolean | string) {
  if (fs.existsSync(outPath)) {

    if (!force) {
      throw new Error(`A bundle named '${outPath}' already exists. Use the --force option to overwrite it.`);
    }

    fs.unlinkSync(outPath);
  } else {
    let dirPath = path.dirname(outPath);

    if (!fs.existsSync(dirPath)) {
      mkdirp.sync(dirPath);
    }
  }
  let source = output.source;

  if (sourceMap && sourceMap !== 'inline') {
    let sourceMapFileName = path.basename(outPath) + '.map';
    source += '\n//# sourceMappingURL=' + sourceMapFileName;
  }

  fs.writeFileSync(outPath, source);
}

export function injectBundle(builder: Builder.BuilderInstance, output: Builder.Output, outfile: string, cfg: BundleConfig) {
  let configPath = cfg.injectionConfigPath as string;
  let bundleName = builder.getCanonicalName(sysUtil.toFileURL(path.resolve(cfg.baseURL, outfile)));
  let appCfg = serializer.getAppConfig(configPath);

  if (!appCfg.bundles) {
    appCfg.bundles = {};
  }
  appCfg.bundles[bundleName] = output.modules.sort();
  serializer.saveAppConfig(configPath, appCfg);
}

export function getFullModuleName(moduleName: string, map: any) {
  let cleanName = (n: string) => {
      // strip leading 'registry' prefixes
      let result = n.replace(/^.*:/, '');
      // strip trailing version info
      if (result.charAt(0) === '@') {
          result = '@' + result.substr(1).replace(/@.*$/, '');
      } else {
          result = result.replace(/@.*$/, '');
      }

      return result;
  };

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
