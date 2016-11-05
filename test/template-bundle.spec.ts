import fs from 'fs';
import expect from 'expect';
import revHash from 'rev-hash';
import {bundle, getOutputFileName, __RewireAPI__ as bundler} from '../lib/html-import-template-bundler';

let fileBody = '<template>test</template>';
let fsMock = {
  existsSync: path => {
    return;
  },
  readFileSync: path => fileBody,
  writeFileSync: (path, content) => {
    return;
  }
};

bundler.__Rewire__('fs', fsMock);

describe('A template bundler', () => {
  let originalLstat = fs.lstatSync;

  /**
   * We have to overwrite the lstat fn this way because the babel rewire plugin only access own modules
   * but we need to mock glob.sync() which uses lstatSync to check if a file exists
   */
  beforeEach(() => {
    fs.lstatSync = () => ({
      isSymbolicLink: () => false,
      isDirectory: () => false
    });
  });

  /**
   * Teardown mocks
   */
  afterEach(() => {
    fs.lstatSync = originalLstat;
  });
  /**
   * Test if the template bundling writes the templates properly into one file
   */
  it('writes the bundle to disk', () => {
    let spy = expect.spyOn(fsMock, 'writeFileSync');
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
    let revUrl = getOutputFileName(baseURL, bundleName, content, true);
    let revLessUrl = getOutputFileName(baseURL, bundleName, content, false);

    expect(revUrl).toContain(expectedHash);
    expect(revLessUrl).toNotContain(expectedHash);
  });
});
