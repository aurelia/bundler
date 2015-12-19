import _ from 'lodash';
import revPath from 'rev-path';
import revHash from 'rev-hash';

export function getOutFileName(source, fileName, rev) {
  return rev ? revPath(fileName, revHash(new Buffer(source, 'utf-8'))) : fileName;
}

export function getBundleConfig(_bundleCfg, bundleName, config) {
  return _.defaults(_bundleCfg, {
    includes: [],
    excludes: [],
    options: {
      rev: false,
      minify: false,
      inject: true
    },
    bundleName: bundleName,
    force: config.force,
    baseURL: config.baseURL,
    configPath: config.configPath,
    builderCfg: config.builderCfg
  });
}

export function getCommonConfig(_config) {
  return _.defaults(_config, {
    force: false,
    baseURL: '.',
    configPath: '.',
    builderCfg: {},
    bundles: {}
  });
}
