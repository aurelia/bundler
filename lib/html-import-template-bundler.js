import Promise from 'bluebird';
import whacko from 'whacko';
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import utils from 'systemjs-builder/lib/utils';
import Builder from 'systemjs-builder';
import _ from 'lodash';

export function bundle(cfg) {
  let builder = new Builder(cfg.baseURL, cfg.configPath);
  builder.config(cfg.builderCfg);

  let templates = [];
  let baseURL = path.resolve(cfg.baseURL);
  let outfile = path.resolve(baseURL, cfg.bundleName) + '.html';

  if (fs.existsSync(outfile)) {
    if (!cfg.force) {
      throw new Error(`A bundle named '${outfile}' already exists. Use the --force option to overwrite it.`);
    }
    fs.unlinkSync(outfile);
  }

  globby
    .sync(cfg.includes, {
      cwd: baseURL.replace(/\\/g, '/')
    })
    .forEach(function(file) {
      if(file != '.') {
        file = path.resolve(baseURL, file);
        let content = fs.readFileSync(file, {
          encoding: 'utf8'
        });
  
        let $ = whacko.load(content);
        let name = getCanonicalName(builder, file, 'view').replace(/!view$/g, '');
  
        $('template').attr('id', name);
        let template = $.html('template');
        templates.push(template);
      }
    });

  fs.writeFileSync(outfile, templates.join('\n'));

  if (cfg.options.inject) {
    injectLink(outfile, baseURL, cfg.options.inject);
  }

  return Promise.resolve();
}


function injectLink(outfile, baseURL, inject) {
  let bundleFile = path.resolve(baseURL, path.relative(baseURL, outfile));
  let indexFile = path.resolve(baseURL, inject.indexFile);
  let destFile = path.resolve(baseURL, inject.destFile);
  let relpath = path.relative(path.dirname(indexFile), path.dirname(bundleFile)).replace(/\\/g, '/');

  let link = createLink(bundleFile, relpath);
  addLink(link, indexFile, destFile);
}

function addLink(link, indexFile, destFile){
  let content = fs.readFileSync(indexFile, {
    encoding: 'utf8'
  });

  let $ = whacko.load(content);

  if ($('link[aurelia-view-bundle][href="' + link + '"]').length === 0) {
    $('head').append('<link aurelia-view-bundle rel="import" href="' + link + '">');
  }

  fs.writeFileSync(destFile, $.html());
}

function createLink(bundleFile, relpath){
  if (!relpath.startsWith('.')) {
    return relpath ? './' + relpath + '/' + path.basename(bundleFile) : './' + path.basename(bundleFile);
  } else {
    return relpath + '/' + path.basename(bundleFile);
  }
}

function getCanonicalName(builder, file, pluginName) {
  return builder.getCanonicalName(utils.toFileURL(file) + '!' + pluginName);
}
