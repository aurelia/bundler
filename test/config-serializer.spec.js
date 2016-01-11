import {
  expect
}
from 'chai';
import {
  readConfig, serializeConfig
}
from '../lib/config-serializer.js';

describe('Config Serializer', () => {

  let inpCfg = `System.config({ defaultJSExtensions: true })`;


  it('reads configuration from the config file', () => {
    let cfg = readConfig(inpCfg);
    expect(cfg.defaultJSExtensions).to.equal(true);
  });


  it('can serialize updated configuration', () => {
    let cfg = readConfig(inpCfg);
    let outCfg =
`System.config({
  defaultJSExtensions: true,
  bundles: {
    "app-bundle.js": [
      "app/boot",
      "app/main"
    ]
  }
})`;

    cfg.bundles = {
      'app-bundle.js': [
        "app/boot",
        "app/main",
      ]
    };

    let str = serializeConfig(cfg);
    expect(str).to.be.equal(outCfg);
  });

  it("does not quote top-level keys", () => {

    let cfg = {
      defaultJSExtensions: true,
      bundles: {
        "app-bundle.js": [
          "app/boot",
          "app/main"
        ]
      },
      depCache: {
        "a": "b",
         c: "d"
      },
      "map" : {}
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
})`;

    let str = serializeConfig(cfg);
    expect(str).to.be.equal(out);

  });

})
