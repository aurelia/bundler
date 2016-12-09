import * as Promise from 'bluebird';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as globby from 'globby';
import * as sysUtils from 'systemjs-builder/lib/utils.js';
import * as utils from './utils';
import * as Builder from 'systemjs-builder';
import {BundleConfig, Inject} from './models';

export function bundle(cfg: BundleConfig) {
  let baseURL = path.resolve(cfg.baseURL);
  let builder = new Builder(cfg.baseURL, cfg.configPath);
  builder.config(cfg.builderCfg);

  let output = generateOutput(baseURL, cfg.includes as string[], builder);
  let outputFileName = getOutputFileName(baseURL, cfg.bundleName, output, (cfg.options && cfg.options.rev) as boolean);

  if (fs.existsSync(outputFileName)) {
    if (!cfg.force) {
      throw new Error(`A bundle named '${outputFileName}' already exists. Use the --force option to overwrite it.`);
    }
    fs.unlinkSync(outputFileName);
  }

  fs.writeFileSync(outputFileName, output);

  if (cfg.options && cfg.options.inject) {
    injectLink(outputFileName, baseURL, cfg.options.inject as Inject);
  }

  return Promise.resolve();
}

export function generateOutput(baseURL: string, includes: string[], builder: Builder.BuilderInstance) {
  let templates: string[] = [];

  globby
    .sync(includes, {
      cwd: baseURL.replace(/\\/g, '/')
    })
    .forEach((file) => {
      if (file !== '.') {
        file = path.resolve(baseURL, file);
        let content = fs.readFileSync(file, {
          encoding: 'utf8'
        });
        let $ = cheerio.load(content);
        let name = getCanonicalName(builder, file, 'view').replace(/!view$/g, '');

        $('template').attr('id', name);
        let template = $.html('template');

        templates.push(template);
      }
    });
  return templates.join('\n');
}

export function getOutputFileName(baseURL: string, bundleName: string, output: string, rev: boolean) {
  let outFileName = utils.getOutFileName(output, bundleName + '.html', rev);
  return path.resolve(baseURL, outFileName);
}

function injectLink(outfile: string, baseURL: string, inject: Inject) {
  let bundleFile = path.resolve(baseURL, path.relative(baseURL, outfile));
  let indexFile = path.resolve(baseURL, inject.indexFile);
  let destFile = path.resolve(baseURL, inject.destFile);
  let relPath = path.relative(path.dirname(indexFile), path.dirname(bundleFile)).replace(/\\/g, '/');
  let link = createLink(bundleFile, relPath);
  addLink(link, indexFile, destFile);
}

function addLink(link: string, indexFile: string, destFile: string) {
  let content = fs.readFileSync(indexFile, {
    encoding: 'utf8'
  });

  let $ = cheerio.load(content);

  if ($('link[aurelia-view-bundle][href="' + link + '"]').length === 0) {
    $('head').append('<link aurelia-view-bundle rel="import" href="' + link + '">');
  }

  fs.writeFileSync(destFile, $.html());
}

function createLink(bundleFile: string, relPath: string) {
  if (!relPath.startsWith('.')) {
    return relPath ? './' + relPath + '/' + path.basename(bundleFile) : './' + path.basename(bundleFile);
  } else {
    return relPath + '/' + path.basename(bundleFile);
  }
}

function getCanonicalName(builder: Builder.BuilderInstance, file: string, pluginName: string) {
  return builder.getCanonicalName(sysUtils.toFileURL(file) + '!' + pluginName);
}
