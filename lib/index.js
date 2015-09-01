import Promise from 'bluebird';
import bundler from './bundler';
import hitb from './html-import-template-bundler';

export default function bundle(config) {
  let tasks = [];

  Object.keys(config)
    .forEach(key => {
      let cfg = config[key];
      if (cfg.htmlimport) {
        tasks.push(bundleHtmlImportTemplate(cfg));
      } else {
        tasks.push(bundle(cfg))
      }
    });

  return Promise.all(tasks)
    .then(() => {
      console.log('Bundling completed.');
    })
    .catch((e)=> {
      console.log(e);
    });
}

function bundle(cfg) {
  let outfile = key + '.js';
  let opt = cfg.options;

  opt.force = config.force;
  opt.packagePath = config.packagePath;

  return bundler.bundle(cfg.modules, outfile, opt);
}

function bundleHtmlImportTemplate(cfg) {
  let outfile = key + '.html';
  let pattern = cfg.pattern;
  let opt = cfg.options;

  opt.force = config.force;
  opt.packagePath = config.packagePath;

  return hitb.bundleTemplate(pattern, outfile, opt);
}
