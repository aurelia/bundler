import { expect } from 'chai';
import { readConfig, serializeConfig } from '../lib/config-serializer.js';

describe('Config Serializer', () => {

let inpCfg = `System.config({ defaultJSExtensions: true })`;
let outCfg = `System.config({ defaultJSExtensions: true, bundles: { 'app-bundle.js': []}})`;

  it('reads configuration for the config file', () => {
     let cfg = readConfig(inpCfg); 
     expect(cfg.defaultJSExtensions).to.equal(true);
  });


  xit('writes modified configuration back to config file', () => {
     let cfg = readConfig(inpCfg);
    cfg.bundles = {
      'app-bundle.js' : []
    }; 
    let str = serializeConfig(cfg);
    expect(str).to.be.equal(outCfg);
  });

})
