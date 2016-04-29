var vm = require('vm');
var fs = require('fs');

export function readConfig(cfgCode) {
  let cfg = {};
  let sandbox = {};
  let configFunc = (_cfg) => {
    for (let key in _cfg) {
      cfg[key] = _cfg[key];
    }
  }
  
  sandbox.System = {
    config: configFunc 
  };

  sandbox.SystemJS = {
    config: configFunc 
  };
  
  vm.createContext(sandbox);
  
  cfgCode.forEach(c => {
    vm.runInContext(c, sandbox);
  })
  
  return cfg;
}

export function isSystemJS(cfgCode) {
  let res = false;
  let sandbox = {};
  
  sandbox.SystemJS = {
    config:  function(cfg) {
      res = true;
    }
  };
  sandbox.System = {
    config: function(cfg) {}
  }
  
  vm.createContext(sandbox);
  vm.runInContext(cfgCode, sandbox);
  
  return res;
}

export function isSystem(cfgCode) {
  let res = false;
  let sandbox = {};
  sandbox.System = {
    config:  function(cfg) {
      res = true;
    }
  };
  
  sandbox.SystemJS = {
    config: function(cfg) {}
  }
  
  vm.createContext(sandbox);
  vm.runInContext(cfgCode, sandbox);
  
  return res;
}

export function serializeConfig(config, _isSystemJS) {
  let tab = '  ';
  let json = JSON.stringify(config, null, 2)
              .replace(new RegExp('^' + tab + '"(\\w+)"', 'mg'), tab + '$1');
  
  if(_isSystemJS) {
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
  
  let  appCfg = readConfig(configCode);

  if(!appCfg.map){
    appCfg.map = {};
  }
  return appCfg;
}

export function saveAppConfig(configPath, config) {
  fs.writeFileSync(configPath, serializeConfig(config, isSystemJS(fs.readFileSync(configPath, 'utf8'))));
}