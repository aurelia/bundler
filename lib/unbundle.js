import jspm from 'jspm';
import Promise from 'bluebird';
import whacko from 'whacko';
import _ from 'lodash';
import fs from 'fs';
import utils from 'systemjs-builder/lib/utils';
import path from 'path';

export function unbundle(_config) {

  let config = _.defaultsDeep(_config, {
    force : false,
    packagePath: '.',
    bundles: {}
  });

  jspm.setPackagePath(config.packagePath);

  let builder = new jspm.Builder();

  let tasks = [
    removeBundles(config), 
    removeHtmlImportBundles(config, builder)
  ];

  return Promise.all(tasks);
}


function removeBundles(config) {
  return jspm.unbundle();
}

function removeHtmlImportBundles(config, builder) {

  let baseURL = utils.fromFileURL(builder.loader.baseURL);

  let tasks = [];

  Object
    .keys(config.bundles)
    .forEach((key) => {

      let cfg = config.bundles[key];
      if(cfg.htmlimport){
         tasks.push(_removeHtmlImportBundle(cfg, baseURL, key))
      }
    });

  return Promise.all(tasks);
}

function _removeHtmlImportBundle(_cfg, _baseURL, bundleName) {

  if(!_cfg) Promise.resolve();
  if(!_cfg.options) _cfg.options = {};

  let inject = _cfg.options.inject;

  if(!inject) Promise.resolve();
  if(!_.isObject(inject)) inject = {};

  let _inject = _.defaults(inject, {
    indexFile: 'index.html',
    destFile: 'index.html'
  });

  let file = path.resolve(_baseURL, _inject.destFile);

  return Promise
    .promisify(fs.readFile)(file, {
      encoding: 'utf8'
    })
    .then((content) => {
      let $ = whacko.load(content);
      return Promise.resolve($);
    })
    .then(($) => {
      return removeLinkInjections($)
    })
    .then(($) => {
      return Promise.promisify(fs.writeFile)(file, $.html());
    });
}

function removeLinkInjections($) {
  $('link[aurelia-view-bundle]').remove();
  return Promise.resolve($);
}
