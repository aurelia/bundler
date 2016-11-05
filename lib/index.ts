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

export function bundle(bundleConfig) {
  let tasks = [];
  let commonCfg = getCommonConfig(bundleConfig);

  validateConfig(commonCfg);

  let bundles = commonCfg.bundles;
  Object.keys(bundles)
    .forEach(key => {
      let cfg = bundles[key];
      if (cfg.skip) {
        return;
      }

      if (cfg.htmlimport) {
        tasks.push(_bundleHtmlImportTemplate(cfg, key, commonCfg));
      } else {
        tasks.push(_bundle(cfg, key, commonCfg));
      }
    });

  return Promise.all(tasks);
}

export function depCache(bundleConfig) {
  let tasks = [];
  let config = getCommonConfig(bundleConfig);

  validateConfig(config);

  let bundles = config.bundles;
  Object.keys(bundles)
    .forEach(key => {
      let cfg = bundles[key];

      if (cfg.skip) {
        return;
      }
      if (cfg.htmlimport) {
        return;
      }
      tasks.push(bundler.depCache(getBundleConfig(cfg, key, config)));
    });

  return Promise.all(tasks);
}

function _bundle(bundleCfg, bundleName, config) {
  return bundler.bundle(getBundleConfig(bundleCfg, bundleName, config));
}

function _bundleHtmlImportTemplate(bundleCfg, bundleName, config) {
  return hitb.bundle(
     getHtmlImportBundleConfig(bundleCfg, bundleName, config));
}
