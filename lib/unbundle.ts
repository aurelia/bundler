import * as Promise from 'bluebird';
import whacko from 'whacko';
import * as fs from 'fs';
import * as path from 'path';
import { getAppConfig, saveAppConfig } from './config-serializer';
import {
  getCommonConfig,
  validateConfig,
  getHtmlImportBundleConfig
} from './utils';

export function unbundle(cfg) {
  let config =  getCommonConfig(cfg);
  validateConfig(config);

  let tasks = [
    removeBundles(config),
    removeHtmlImportBundles(config)
  ];

  return Promise.all(tasks);
}

function removeBundles(cfg) {
  let configPath = cfg.injectionConfigPath;
  let appCfg = getAppConfig(configPath);
  delete appCfg.bundles;
  delete appCfg.depCache;
  saveAppConfig(configPath, appCfg);

  return Promise.resolve();
}

function removeHtmlImportBundles(config) {
  let tasks: Promise[] = [];

  Object
    .keys(config.bundles)
    .forEach((key) => {
      let cfg = config.bundles[key];
      if (cfg.htmlimport) {
        tasks.push(_removeHtmlImportBundle(getHtmlImportBundleConfig(cfg, key, config)));
      }
    });

  return Promise.all(tasks);
}

function _removeHtmlImportBundle(cfg) {

  let file = path.resolve(cfg.baseURL, cfg.options.inject.destFile);

  if (!fs.existsSync(file)) {
    return Promise.resolve();
  }

  return Promise
    .promisify(fs.readFile)(file, {
      encoding: 'utf8'
    })
    .then((content) => {
      let $ = whacko.load(content);
      return Promise.resolve($);
    })
    .then(($) => {
      return removeLinkInjections($);
    })
    .then(($) => {
      return Promise.promisify(fs.writeFile)(file, $.html());
    });
}

function removeLinkInjections($) {
  $('link[aurelia-view-bundle]').remove();
  return Promise.resolve($);
}
