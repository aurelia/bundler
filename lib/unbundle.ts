import * as Promise from 'bluebird';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { getAppConfig, saveAppConfig } from './config-serializer';
import {Config, BundleConfig, Inject} from './models';
import {
  ensureDefaults,
  validateConfig,
  getHtmlImportBundleConfig,
} from './utils';

export function unbundle(cfg: Config) {
  let config =  ensureDefaults(cfg);
  validateConfig(config);

  let tasks = [
    removeBundles(config),
    removeHtmlImportBundles(config)
  ];

  return Promise.all<any>(tasks);
}

function removeBundles(cfg: Config) {
  let configPath = cfg.injectionConfigPath;
  let appCfg = getAppConfig(configPath as string);
  delete appCfg.bundles;
  delete appCfg.depCache;
  saveAppConfig(configPath as string, appCfg);

  return Promise.resolve();
}

function removeHtmlImportBundles(config: Config) {
  let tasks: Promise<any>[] = [];
  Object
    .keys(config.bundles)
    .forEach((key) => {
      let cfg = config.bundles[key];
      if (cfg.htmlimport) {
        tasks.push(_removeHtmlImportBundle(getHtmlImportBundleConfig(cfg, key, config)));
      }
    });

  return Promise.all<any>(tasks);
}

function _removeHtmlImportBundle(cfg: BundleConfig) {
  let inject =  cfg.options.inject as Inject;
  let file = path.resolve(cfg.baseURL, inject.destFile);

  if (!fs.existsSync(file)) {
    return Promise.resolve();
  }

  return Promise
    .promisify<string, string, any>(fs.readFile)(file, {
      encoding: 'utf8'
    })
    .then((content) => {
      let $ = cheerio.load(content);
      return Promise.resolve($);
    })
    .then(($) => {
      return removeLinkInjections($);
    })
    .then(($) => {
      return Promise.promisify<void, string, string>(fs.writeFile)(file, $.html());
    });
}

function removeLinkInjections($: CheerioStatic) {
  $('link[aurelia-view-bundle]').remove();
  return Promise.resolve($);
}
