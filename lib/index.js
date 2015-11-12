import Promise from 'bluebird';
import * as bundler from './bundler';
import * as hitb from './html-import-template-bundler';
import _ from 'lodash';

export * from './unbundle';

export function bundle(_config) {

  let tasks = [];
  let config = _.defaults(_config, {
    force : false,
    packagePath: '.',
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

function _bundle(_cfg, name, config) {

  let cfg = _.defaults(_cfg, {
    includes : [],
    excludes : [],
    options: {}
  });

  let outfile = name + '.js';
  let opt = cfg.options;

  opt.force = config.force;
  opt.packagePath = config.packagePath;

  return bundler.bundle(cfg.includes, cfg.excludes, outfile, opt);
}

function _bundleHtmlImportTemplate(cfg, name, config) {

  let outfile = name + '.html';
  let includes = cfg.includes;
  let opt = cfg.options;

  opt.force = config.force;
  opt.packagePath = config.packagePath;

  return hitb.bundle(includes, outfile, opt);
}
