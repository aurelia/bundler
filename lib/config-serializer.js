var vm = require('vm');
var fs = require('fs');

export function readConfig(cfgCode) {
  var sandbox = {};
  sandbox.System = {
    cfg: {},
    config: function(cfg) {
      for (let key in cfg) {
        this.cfg[key] = cfg[key];
      }
    }
  };

  var ctx = vm.createContext(sandbox);
  vm.runInContext(cfgCode, sandbox);
  return sandbox.System.cfg;
}

export function serializeConfig(config) {
  let tab = '  ';
  let json = JSON.stringify(config, null, 2)
              .replace(new RegExp('^' + tab + '"(\\w+)"', 'mg'), tab + '$1');

  return `System.config(${json})`;
}

export function getAppConfig(configPath) {
  let appCfg = readConfig(fs.readFileSync(configPath, 'utf8'));

  if(!appCfg.map){
    appCfg.map = {};
  }
  return appCfg;
}

export function saveAppConfig(configPath, config) {
  fs.writeFileSync(configPath, serializeConfig(config));
}
