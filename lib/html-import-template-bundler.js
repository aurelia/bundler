import Promise from 'bluebird';
import jspm from 'jspm';
import whacko from 'whacko';
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import utils from 'systemjs-builder/lib/utils';
import _ from 'lodash';

export function bundle(pattern, fileName, _opts) {
  let templates = [];

  let options = _.defaultsDeep(_opts, {
    packagePath: '.'
  });

  jspm.setPackagePath(options.packagePath);

  let builderCfg = options.builderCfg || {};
  let builder = new jspm.Builder(builderCfg);
  let baseURL = builder.loader.baseURL;
  let cwd = utils.fromFileURL(baseURL);;

  let outfile = path.resolve(utils.fromFileURL(baseURL), fileName);

  if (fs.existsSync(outfile)) {
    if (!options.force) {
      throw new Error(`A bundle named '${outfile}' is already exists. Use --force to overwrite.`);
    }
    fs.unlinkSync(outfile);
  }

  globby
    .sync(pattern, {
      cwd: cwd.replace(/\\/g, '/')
    })
    .forEach(function(file) {
      file = path.resolve(cwd, file);
      var content = fs.readFileSync(file, {
        encoding: 'utf8'
      });

      var $ = whacko.load(content);
      var name = getCanonicalName(builder, file, 'view').replace(/!view$/g, '');

      $('template').attr('id', name);
      var template = $.html('template');
      templates.push(template);
    });

  fs.writeFileSync(outfile, templates.join('\n'));

  if (options.inject) {
    injectLink(outfile, utils.fromFileURL(baseURL), options.inject);
  }

  return Promise.resolve();
}


function injectLink(outfile, baseURL, injectOptions) {
  var link = '';
  var fileName = injectOptions.indexFile;
  var bundle = path.resolve(baseURL, path.relative(baseURL, outfile));
  var index = path.resolve(baseURL, fileName || 'index.html');
  var destFile = injectOptions.destFile ? path.resolve(baseURL, injectOptions.destFile) : index;

  var relpath = path.relative(path.dirname(index), path.dirname(bundle)).replace(/\\/g, '/');

  if (!relpath.startsWith('.')) {
    link = relpath ? './' + relpath + '/' + path.basename(bundle) : './' + path.basename(bundle);
  } else {
    link = relpath + '/' + path.basename(bundle);
  }

  var content = fs.readFileSync(index, {
    encoding: 'utf8'
  });

  var $ = whacko.load(content);

  if ($('link[aurelia-view-bundle][href="' + link + '"]').length === 0) {
    $('head').append('<link aurelia-view-bundle rel="import" href="' + link + '">');
  }

  fs.writeFileSync(destFile, $.html());
}

function getCanonicalName(builder, file, pluginName) {
  return builder.getCanonicalName(utils.toFileURL(file) + '!' + pluginName);
}
