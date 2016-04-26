import {expect} from 'chai';
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
    expect(cfg.defaultJSExtensions).to.equal(true);
  });

  it('can read configuration from SystemJS', () => {
    let SystemJSCfg = 'SystemJS.config({ defaultJSExtensions: true })';
    let cfg = readConfig([SystemJSCfg]);
    expect(cfg.defaultJSExtensions).to.equal(true);
  });
  
  it('reads config from multiple files', () => {
    let inpCfg = 'System.config({ defaultJSExtensions: true })';
    let inpCfg2 = 'System.config({ valueFrom2ndFile : true })';
    
    let cfg = readConfig([inpCfg, inpCfg2]);
    expect(cfg.defaultJSExtensions).to.equal(true);
    expect(cfg.valueFrom2ndFile).to.equal(true);
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
    expect(str).to.be.equal(outCfg);
  });

  it('can detect System and/or SystemJS', ()=> {
    let inpCfg = 'System.config({ defaultJSExtensions: true })';
    let inpCfg2 = 'SystemJS.config({ valueFrom2ndFile : true })';
    
    expect(isSystem(inpCfg)).to.equal(true);
    expect(isSystemJS(inpCfg2)).to.equal(true);
    
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
    expect(str).to.be.equal(out);
  });
});
