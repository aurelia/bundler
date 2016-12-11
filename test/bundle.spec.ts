import * as sysUtil from 'systemjs-builder/lib/utils.js';
import * as fs from 'fs';
import * as path from 'path';
import expect from 'expect';
import {BundleConfig} from '../lib/models';
import * as sinon from 'sinon';
import * as bundler from '../lib/bundler';
import * as Builder from 'systemjs-builder';

describe('inject bundle', () => {
  it('saves bundle config to disk', () => {
    let appCfg = { bundles: {} };
    let configPath = '';
    let saveAppConfigSpy = sinon.spy(bundler, 'saveAppConfig');
    sinon.stub(bundler, 'getAppConfig').returnValue(appCfg);
    sinon.stub(sysUtil, 'toFileURL');
    let cfg = {
      baseURL: '',
      options: {
        injectionConfigPath: configPath
      }
    };

    let builder = new Builder('.');
    sinon.stub(builder, 'getCanonicalName');
    let output = { modules: [], source: '', sourceMap: '' };
    let outfile = '';

    bundler.injectBundle(builder, output, outfile, cfg as any as  BundleConfig);
    expect(saveAppConfigSpy.calledOnce).toBe(true);
  });
});

describe('write bundle output', () => {
  it('writes the bundler file to disk', () => {
    let spy = sinon.spy(path, 'resolve');
    bundler.writeOutput({ source: 'sdfsdf', sourceMap: '', modules: [] }, 'the outfile', 'the base URL', true, false);
    expect(spy.calledOnce).toBe(true);
  });

  it('creates output directory when not exists', () => {
    let spy = sinon.spy(fs, 'mkdirSync');
    sinon.stub(fs, 'existsSync').returnValue(false);

    bundler.writeOutput(
       { source: 'bundler source', sourceMap: '', modules: [] },
       'outfile', 'base URL', true, false);
    expect(spy.calledOnce).toBe(true);
  });

  describe('given out file exits', () => {
    it('does not overwrite the out file', () => {
      let spy: sinon.SinonStub = sinon.stub('fs', 'existsSync').returnValue(true);
      expect(() => {
        bundler.writeOutput(
          { source: 'bundler source', sourceMap: '', modules: [] },
          'outfile',
          'base URL', false, false);
      }).toThrow(/A bundle named/);

      expect(spy.calledOnce).toBe(true);
    });

    it('removes the existing file when `force` option is supplied', () => {
      sinon.stub(fs, 'existsSync').returnValue(true);
      let unlinkSpy = sinon.spy(fs, 'unlinkSync');

      expect(() => {
        bundler.writeOutput(
          { source: 'bundler source', sourceMap: '', modules: [] },
          'outfile',
          'base URL', true, false);
      }).toNotThrow(/A bundle named/);

      expect(unlinkSpy.calledOnce).toBe(true);
    });
  });
});
