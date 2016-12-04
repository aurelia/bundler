import * as Promise from 'bluebird';
import * as bundler from './bundler';
import * as hitb from './html-import-template-bundler';
import {BundleConfig, Config, ConfigBody} from './models';
import {
  ensureDefaults,
  getBundleConfig,
  validateConfig,
  getHtmlImportBundleConfig, 
} from './utils';

export * from './unbundle';

export function bundle(_config: Config) {
  let tasks: Promise<void>[] = [];
  let config = ensureDefaults(_config);
  validateConfig(config);

  Object.keys(config.bundles)
    .forEach(key => {
      let cfg = config.bundles[key];
      if (cfg.skip) {
        return;
      }
      if (cfg.htmlimport) {
        tasks.push(hitb.bundle(getHtmlImportBundleConfig(cfg, key, config)));
      } else {
        tasks.push(bundler.bundle(getBundleConfig(cfg, key, config)));
      }
    });

  return Promise.all(tasks);
}

export function depCache(bundleConfig: Config) {
  let tasks: Promise<void>[] = [];
  let config = ensureDefaults(bundleConfig);
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
