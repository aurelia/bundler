import { expect } from 'chai';
import { readConfig, serializeConfig } from '../lib/config-serializer.js';

describe('Config Serializer', () => {

  let inpCfg = `System.config({ defaultJSExtensions: true })`;
  let outCfg = 
`System.config({
  "defaultJSExtensions": true,
  "bundles": {
    "app-bundle.js": [
      "app/boot",
      "app/main"
    ]
  }
})`;

  it('reads configuration from the config file', () => {
    let cfg = readConfig(inpCfg);
    expect(cfg.defaultJSExtensions).to.equal(true);
  });


  it('can serialize updated configuration', () => {
    let cfg = readConfig(inpCfg);

    cfg.bundles = {
      'app-bundle.js': [
        "app/boot",
        "app/main",
      ]
    };

    let str = serializeConfig(cfg);
    expect(str).to.be.equal(outCfg);
  });

})
