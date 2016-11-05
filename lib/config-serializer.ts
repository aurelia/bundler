import * as vm from 'vm';
import * as fs from 'fs';

interface AppConfig {
  baseURL: string;
  map: {};
  depCache: {};
  bundles: {};
}

export function readConfig(cfgCode): AppConfig {
  let cfg = {};
  let configFunc = (systemCfg) => {
    for (let key in systemCfg) {
      if (systemCfg.hasOwnProperty(key)) {
        cfg[key] = systemCfg[key];
      }
    }
  };
  let sandbox = {
    System: {
      config: configFunc
    },
    SystemJS: {
      config: configFunc
    }
  };
  vm.createContext(sandbox);
  cfgCode.forEach(c => {
    vm.runInContext(c, sandbox);
  });
  return cfg as AppConfig;
}

export function isSystemJS(cfgCode) {
  let res = false;
  let sandbox = {
    SystemJS: {
      config: () => {
        res = true;
      }
    },
    System: {
      config: () => {
        res = false;
      }
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(cfgCode, sandbox);
  return res;
}

export function isSystem(cfgCode) {
  let res = false;
  let sandbox = {
    System: {
      config: () => {
        res = true;
      }
    },
    SystemJS: {
      config: () => {
        res = false;
      }
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(cfgCode, sandbox);

  return res;
}

export function serializeConfig(config, isSystemJS) {
  let tab = '  ';
  let json = JSON.stringify(config, null, 2)
    .replace(new RegExp('^' + tab + '"(\\w+)"', 'mg'), tab + '$1');

  if (isSystemJS) {
    return `SystemJS.config(${json});`;
  }
  return `System.config(${json});`;
}

export function getAppConfig(configPath) {
  let configCode = [];

  if (typeof configPath === 'string') {
    configCode.push(fs.readFileSync(configPath, 'utf8'));
  }

  if (Array.isArray(configPath)) {
    configPath.forEach(cp => {
      configCode.push(fs.readFileSync(cp, 'utf8'));
    });
  }

  let appCfg = readConfig(configCode);

  if (!appCfg.map) {
    appCfg.map = {};
  }
  return appCfg;
}

export function saveAppConfig(configPath, config) {
  fs.writeFileSync(configPath, serializeConfig(config, isSystemJS(fs.readFileSync(configPath, 'utf8'))));
}
