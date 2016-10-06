import expect from 'expect';
import revHash from 'rev-hash';
import {bundle, writeOutput, __RewireAPI__ as bundler} from '../lib/html-import-template-bundler';

let fileBody = '<template>test</template>';
let fs = {
  existsSync: path => { },
  readFileSync: path => fileBody,
  writeFileSync: (path, string) => { }
};

bundler.__Rewire__('fs', fs);

describe('A template bundler', () => {
  /**
   * Test if the template bundling writes the templates properly into one file
   */
  it('writes the bundle to disk', () => {
    let spy = expect.spyOn(fs, 'writeFileSync');
    bundle({baseURL: '.', bundleName: 'tmp-bundle', includes: ['tmp1', 'tmp2']});
    expect(spy.calls.length).toBe(1);
    expect(spy.calls[0].arguments[1]).toBe('<template id="tmp1">test</template>\n<template id="tmp2">test</template>');
  });

  /**
   * Tests if the revisioning works properly and appends a content based hash to the output fileName
   */
  it('appends a hash to file name', () => {
    let baseURL = 'url';
    let bundleName = 'bundle';
    let content = 'test\ntest';
    // Create expected hash and generate urls
    let expectedHash = revHash(new Buffer(content, 'utf-8'));
    let revUrl = writeOutput(baseURL, bundleName, content, {rev: true});
    let revLessUrl = writeOutput(baseURL, bundleName, content, {rev: false});

    expect(revUrl).toContain(expectedHash);
    expect(revLessUrl).toNotContain(expectedHash);
  });
});
