import Promise from 'bluebird';
import * as bundler from './bundler';
import * as hitb from './html-import-template-bundler';
import _ from 'lodash';

export * from './unbundle';

export function bundle(_config) {

  let tasks = [];

  let config = _.defaults(_config, {
    force : false,
    baseURL: '.',
    configPath: '.',
    builderCfg: {},
    bundles : {}
  });

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

  let bundleCfg = _.defaults(_bundleCfg, {
    includes : [],
    excludes : [],
    options: {
      rev: false,
      minify: false,
      inject: true
    },
    bundleName : bundleName,
    force : config.force,
    baseURL: config.baseURL,
    configPath: config.configPath,
    builderCfg: config.builderCfg
  });

  return bundler.bundle(bundleCfg);
}

function _bundleHtmlImportTemplate(cfg, name, config) {

  let outfile = name + '.html';
  let includes = cfg.includes;
  let opt = cfg.options;

  opt.force = config.force;
  opt.packagePath = config.packagePath;

  return hitb.bundle(includes, outfile, opt);
}
