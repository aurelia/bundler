var vm = require('vm');
var fs = require('fs');

export function readConfig(cfgCode) {
  let sandbox = {};
  sandbox.System = {
    cfg: {},
    config: function(cfg) {
      for (let key in cfg) {
        this.cfg[key] = cfg[key];
      }
    }
  };

  vm.createContext(sandbox);
  
  if(typeof cfgCode === 'string') { 
    vm.runInContext(cfgCode, sandbox);
  }
  
  if(Array.isArray(cfgCode)) {
    cfgCode.forEach(c => {
      vm.runInContext(c, sandbox);
    })
  }
  
  return sandbox.System.cfg;
}

export function serializeConfig(config) {
  let tab = '  ';
  let json = JSON.stringify(config, null, 2)
              .replace(new RegExp('^' + tab + '"(\\w+)"', 'mg'), tab + '$1');

  return `System.config(${json});`;
}

export function getAppConfig(configPath) {
  let appCfg = {};
  
  if (typeof configPath === 'string') {
    appCfg = readConfig(fs.readFileSync(configPath, 'utf8'));
  }
  
  if (Array.isArray(configPath)) {
    configPath.forEach(cp => {
      
    });  
  }
  

  if(!appCfg.map){
    appCfg.map = {};
  }
  return appCfg;
}

export function saveAppConfig(configPath, config) {
  fs.writeFileSync(configPath, serializeConfig(config));
}