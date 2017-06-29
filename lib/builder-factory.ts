import * as Builder from 'systemjs-builder';
import {BundleConfig} from './models';
import {getAppConfig} from './config-serializer';

export function createBuilder(cfg: BundleConfig) {
  let builder = new Builder(cfg.baseURL);
  let appCfg = getAppConfig(cfg.configPath);
  delete appCfg.baseURL;

  builder.config(appCfg);
  builder.config(cfg.builderCfg);
  return builder;
}
