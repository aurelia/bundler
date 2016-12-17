import * as path from 'path';
import * as fs from 'fs';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as revHash from 'rev-hash';
import * as sinon from 'sinon';
import { bundle, getOutputFileName } from '../lib/html-import-template-bundler';
import { BundleConfig } from '../lib/models';

let expect = chai.expect;
chai.use(sinonChai);

describe('A template bundler', () => {
  it('writes the bundle to disk', async () => {
    let sandbox = sinon.sandbox.create();
    sandbox.stub(fs, 'writeFileSync').returns(0);
    sandbox.stub(fs, 'existsSync').returns(false);
    let cfg = { baseURL: '.', bundleName: 'tmp-bundle', includes: ['test/fixture/tmp1.html', 'test/fixture/tmp2.html'] } as BundleConfig;
    await bundle(cfg);
    let outPath = `${path.resolve(cfg.bundleName)}.html`;

    expect(fs.writeFileSync).to.be.calledWith(outPath, '<template id="test/fixture/tmp1.html">test</template>\n<template id="test/fixture/tmp2.html">test</template>');
    sandbox.restore();
  });

  it('appends a hash to file name', () => {
    let baseURL = 'url';
    let bundleName = 'bundle';
    let content = 'test\ntest';
    let expectedHash = revHash(new Buffer(content, 'utf-8'));
    let revUrl = getOutputFileName(baseURL, bundleName, content, true);
    let revLessUrl = getOutputFileName(baseURL, bundleName, content, false);

    expect(revUrl).to.contain(expectedHash);
    expect(revLessUrl).to.not.contain(expectedHash);
  });
});
