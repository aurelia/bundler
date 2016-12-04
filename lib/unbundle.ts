import * as Promise from 'bluebird';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { getAppConfig, saveAppConfig } from './config-serializer';
import {
  ensureDefaults,
  validateConfig,
  getHtmlImportBundleConfig,
  BaseConfig,
  BundleConfig
} from './utils';

export function unbundle(cfg: BaseConfig) {
  let config =  ensureDefaults(cfg);
  validateConfig(config);

  let tasks = [
    removeBundles(config),
    removeHtmlImportBundles(config)
  ];

  return Promise.all<void>(tasks);
}

function removeBundles(cfg: BaseConfig) {
  let configPath = cfg.injectionConfigPath;
  let appCfg = getAppConfig(configPath);
  delete appCfg.bundles;
  delete appCfg.depCache;
  saveAppConfig(configPath, appCfg);

  return Promise.resolve();
}

function removeHtmlImportBundles(config: BaseConfig) {
  let tasks: Promise<void>[] = [];

  Object
    .keys(config.bundles)
    .forEach((key) => {
      let cfg = config.bundles[key];
      if (cfg.htmlimport) {
        tasks.push(_removeHtmlImportBundle(getHtmlImportBundleConfig(cfg, key, config)));
      }
    });

  return Promise.all<void>(tasks);
}

function _removeHtmlImportBundle(cfg: BundleConfig): Promise<void> {

  let file = path.resolve(cfg.baseURL, cfg.options.inject.destFile);

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
