import Promise from 'bluebird';
import * as bundler from './bundler';
import * as hitb from './html-import-template-bundler';
import _ from 'lodash';
import {getCommonConfig, getBundleConfig} from './utils';

export * from './unbundle';

export function bundle(_config) {

  let tasks = [];
  let config = getCommonConfig(_config);
  let bundles = config.bundles;

  Object.keys(bundles)
    .forEach(key => {

      let cfg = bundles[key];
      if(cfg.skip) return;

      if (cfg.htmlimport) {
        tasks.push(_bundleHtmlImportTemplate(cfg, key, config));
      } else {
        tasks.push(_bundle(cfg, key, config))
      }

    });

  return Promise.all(tasks);
}

function _bundle(_bundleCfg, bundleName, config) {
  return bundler.bundle(getBundleConfig(_bundleCfg, bundleName, config));
}

function _bundleHtmlImportTemplate(cfg, name, config) {

  let outfile = name + '.html';
  let includes = cfg.includes;
  let opt = cfg.options;

  opt.force = config.force;
  opt.packagePath = config.packagePath;

  return hitb.bundle(includes, outfile, opt);
}
