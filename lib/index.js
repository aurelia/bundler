import Promise from 'bluebird';
import * as bundler from './bundler';
import * as hitb from './html-import-template-bundler';
import {
  getCommonConfig,
  getBundleConfig,
  validateConfig,
  getHtmlImportBundleConfig
} from './utils';

export * from './unbundle';

export function bundle(_config) {
  let tasks = [];
  let config = getCommonConfig(_config);

  validateConfig(config);

  let bundles = config.bundles;
  Object.keys(bundles)
    .forEach(key => {
      let cfg = bundles[key];
      if(cfg.skip) return;

      if (cfg.htmlimport) {
        tasks.push(_bundleHtmlImportTemplate(cfg, key, config));
      } else {
        tasks.push(_bundle(cfg, key, config));
      }
    });
  return Promise.all(tasks);
}

export function depCache(_config) {
  let tasks = [];
  let config = getCommonConfig(_config);

  validateConfig(config);

  let bundles = config.bundles;
  Object.keys(bundles)
    .forEach(key => {
      let cfg = bundles[key];

      if(cfg.skip) return;
      if (cfg.htmlimport) return;
      tasks.push(bundler.depCache(getBundleConfig(cfg, key, config)));
    });

  return Promise.all(tasks);
}

function _bundle(_bundleCfg, bundleName, config) {
  return bundler.bundle(getBundleConfig(_bundleCfg, bundleName, config));
}

function _bundleHtmlImportTemplate(_bundleCfg, bundleName, config) {
  return hitb.bundle(
     getHtmlImportBundleConfig(_bundleCfg, bundleName, config));
}
