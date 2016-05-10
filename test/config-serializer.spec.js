import expect from 'expect';
import {
  isSystem,
  isSystemJS,
  readConfig, 
  serializeConfig
} from '../lib/config-serializer.js';

describe('Config Serializer', () => {
  let inpCfg = 'System.config({ defaultJSExtensions: true })';
  
  it('reads configuration from the config file', () => {
    let cfg = readConfig([inpCfg]);
    expect(cfg.defaultJSExtensions).toBeTruthy();
  });

  it('can read configuration from SystemJS', () => {
    let SystemJSCfg = 'SystemJS.config({ defaultJSExtensions: true })';
    let cfg = readConfig([SystemJSCfg]);
    expect(cfg.defaultJSExtensions).toBeTruthy();
  });
  
  it('reads config from multiple files', () => {
    let inpCfg = 'System.config({ defaultJSExtensions: true })';
    let inpCfg2 = 'System.config({ valueFrom2ndFile : true })';
    
    let cfg = readConfig([inpCfg, inpCfg2]);
    expect(cfg.defaultJSExtensions).toBeTruthy();
    expect(cfg.valueFrom2ndFile).toBeTruthy();
  });

  it('can serialize updated configuration', () => {
    let cfg = readConfig([inpCfg]);
    let outCfg =
`System.config({
  defaultJSExtensions: true,
  bundles: {
    "app-bundle.js": [
      "app/boot",
      "app/main"
    ]
  }
});`;

    cfg.bundles = {
      'app-bundle.js': [
        'app/boot',
        'app/main'
      ]
    };

    let str = serializeConfig(cfg);
    expect(str).toBe(outCfg);
  });

  it('can serialize System configuration', () => {
    let cfg = readConfig([inpCfg]);
    let outCfg =
`System.config({
  defaultJSExtensions: true
});`;

    let str = serializeConfig(cfg);
    expect(str).toBe(outCfg);
  });
  
  it('can serialize SystemJS configuration', () => {
    let cfg = readConfig([inpCfg]);
    let outCfg =
`SystemJS.config({
  defaultJSExtensions: true
});`;

    let str = serializeConfig(cfg, true);
    expect(str).toBe(outCfg);
  });
  
  it('can detect System and/or SystemJS', ()=> {
    let inpCfg = 'System.config({ defaultJSExtensions: true })';
    let inpCfg2 = 'SystemJS.config({ valueFrom2ndFile : true })';
    
    expect(isSystem(inpCfg)).toBeTruthy();
    expect(isSystemJS(inpCfg2)).toBeTruthy();
    
  });
  
  it('does not quote top-level keys', () => {
    let cfg = {
      defaultJSExtensions: true,
      bundles: {
        'app-bundle.js': [
          'app/boot',
          'app/main'
        ]
      },
      depCache: {
        'a': 'b',
        c: 'd'
      },
      'map': {}
    };

    let out =
`System.config({
  defaultJSExtensions: true,
  bundles: {
    "app-bundle.js": [
      "app/boot",
      "app/main"
    ]
  },
  depCache: {
    "a": "b",
    "c": "d"
  },
  map: {}
});`;

    let str = serializeConfig(cfg);
    expect(str).toBe(out);
  });
});
