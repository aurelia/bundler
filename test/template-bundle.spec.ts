import * as fs from 'fs';
import expect from 'expect';
import * as revHash from 'rev-hash';
import * as sinon from 'sinon';
import {bundle, getOutputFileName} from '../lib/html-import-template-bundler';
import {BundleConfig} from '../lib/models';

describe('A template bundler', () => {
  it('writes the bundle to disk', () => {
    let spy = sinon.spy(fs, 'writeFileSync');
    bundle({baseURL: '.', bundleName: 'tmp-bundle', includes: ['tmp1', 'tmp2']} as BundleConfig);
    expect(spy.calledWith('<template id="tmp1">test</template>\n<template id="tmp2">test</template>')).toBe(true);
  });

  it('appends a hash to file name', () => {
    let baseURL = 'url';
    let bundleName = 'bundle';
    let content = 'test\ntest';
    let expectedHash = revHash(new Buffer(content, 'utf-8'));
    let revUrl = getOutputFileName(baseURL, bundleName, content, true);
    let revLessUrl = getOutputFileName(baseURL, bundleName, content, false);
    expect(revUrl).toContain(expectedHash);
    expect(revLessUrl).toNotContain(expectedHash);
  });
});
