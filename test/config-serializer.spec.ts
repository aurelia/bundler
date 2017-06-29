import { expect } from 'chai';
import {
  isSystem,
  isSystemJS,
  readConfig,
  serializeConfig
} from '../lib/config-serializer';

describe('Config Serializer', () => {
  let inpCfg = 'System.config({ defaultJSExtensions: true })';

  it('reads configuration from the config file', () => {
    let cfg = readConfig([inpCfg]);
    expect(cfg.defaultJSExtensions).to.be.true;
  });

  it('can read configuration from SystemJS', () => {
    let systemJSCfg = 'SystemJS.config({ defaultJSExtensions: true })';
    let cfg = readConfig([systemJSCfg]);
    expect(cfg.defaultJSExtensions).to.be.true;
  });

  it('reads config from multiple files', () => {
    let inpCfg = 'System.config({ defaultJSExtensions: true })';
    let inpCfg2 = 'System.config({ baseURL : "abc" })';
    let cfg = readConfig([inpCfg, inpCfg2]);
    expect(cfg.defaultJSExtensions).to.be.true;
    expect(cfg.baseURL).to.be.equal('abc');
  });

  describe('Multiple config calls', () => {
    it('reads config from single file', () => {
      let inpCfg = `
SystemJS.config({
  packages: {
    "aurelia-animator-css": {
      "map": {
        "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      }
    }
  }
});
SystemJS.config({ 
  packages: {
    "siopa-skeleton": {
      "format": "amd"
    }
  }
})`;

      let cfg = readConfig([inpCfg]);
      expect(cfg.packages['aurelia-animator-css'].map['aurelia-metadata']).to.be.equal('npm:aurelia-metadata@1.0.3');
      expect(cfg.packages['siopa-skeleton'].format).to.be.equal('amd');
    });

    it('should extend the config not orverrite it', () => {
      let inpCfg = 'System.config({ defaultJSExtensions: true }); System.config({ baseURL : "abc" })';
      let cfg = readConfig([inpCfg]);
      expect(cfg.defaultJSExtensions).to.be.true;
      expect(cfg.baseURL).to.be.equal('abc');
    });
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

  it('can serialize System configuration', () => {
    let cfg = readConfig([inpCfg]);
    let str = serializeConfig(cfg);
    let outCfg =
      `System.config({
  defaultJSExtensions: true
});`;
    expect(str).to.be.equal(outCfg);
  });

  it('can serialize SystemJS configuration', () => {
    let cfg = readConfig([inpCfg]);
    let outCfg =
      `SystemJS.config({
  defaultJSExtensions: true
});`;
    let str = serializeConfig(cfg, true);
    expect(str).to.be.equal(outCfg);
  });

  it('can detect System and/or SystemJS', () => {
    let inpCfg = 'System.config({ defaultJSExtensions: true })';
    let inpCfg2 = 'SystemJS.config({ valueFrom2ndFile : true })';
    expect(isSystem(inpCfg)).to.be.true;
    expect(isSystemJS(inpCfg2)).to.be.true;
  });

  it('does not quote top-level keys', () => {
    let cfg = {
      defaultJSExtensions: true,
      baseURL: '',
      bundles: {
        'app-bundle.js': [
          'app/boot',
          'app/main'
        ]
      },
      depCache: {
        a: 'b',
        c: 'd'
      },
      map: {}
    };

    let out =
      `System.config({
  defaultJSExtensions: true,
  baseURL: "",
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
