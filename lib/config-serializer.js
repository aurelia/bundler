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
  let json = JSON.stringify(config, null, 2);
  return `System.config(${json})`;
}

export function getAppConfig(configPath) {
  return readConfig(fs.readFileSync(configPath, 'utf8'));
}


export function saveAppConfig(configPath, config) {
  fs.writeFileSync(configPath, serializeConfig(config));
}
