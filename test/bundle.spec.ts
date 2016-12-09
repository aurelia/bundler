import * as fs from 'fs';
import * as path from 'path';
import expect from 'expect';
import * as bundler from '../lib/bundler';
import * as sysUtil from 'systemjs-builder/lib/utils.js';
import {BundleConfig} from '../lib/models';
import * as sinon from 'sinon';

describe('inject bundle', () => {
  it('saves bundle config to disk', () => {
    let appCfg = { bundles: {} };
    let configPath = '';
    let saveAppConfigSpy = sinon.spy(bundler, 'saveAppConfig');
    sinon.stub(bundler, 'getAppConfig').returnValue(appCfg);
    sinon.stub(sysUtil, 'toFileURL');

    let cfg: BundleConfig = {
      baseURL: '',
      options: {
        injectionConfigPath: configPath
      }
    };

    let builder = {
      getCanonicalName: () => {
        return;
      }
    };

    let output = { modules: [] };
    let outfile = '';

    bundler.injectBundle(builder, output, outfile, cfg);
    expect(saveAppConfigSpy.calledOnce).toBe(true);
  });
});

describe('write bundle output', () => {
  it('writes the bundler file to disk', () => {
    let spy = sinon.spy(path, 'resolve');
    bundler.writeOutput({ source: 'sdfsdf' }, 'the outfile', 'the base URL', true, false);
    expect(spy.calledOnce).toBe(true);
  });

  it('creates output directory when not exists', () => {
    let spy = sinon.spy(fs, 'mkdirSync');
    sinon.stub(fs, 'existsSync').returnValue(false);

    bundler.writeOutput({ source: 'bundler source' }, 'outfile', 'base URL', true, false);
    expect(spy.calledOnce).toBe(true);
  });

  describe('given out file exits', () => {
    it('does not overwrite the out file', () => {
      let spy = expect.createSpy(fs.existsSync).andReturn(true);
      fs.existsSync = spy;

      expect(() => {
        bundler.writeOutput(
          { source: 'bundler source' },
          'outfile',
          'base URL', false, false);
      }).toThrow(/A bundle named/);

      expect(spy.calls.length).toBe(1);
    });

    it('removes the existing file when `force` option is supplied', () => {
      fs.existsSync = expect.createSpy(fs.existsSync).andReturn(true);

      let unlinkSpy = expect.spyOn(fs, 'unlinkSync');

      expect(() => {
        bundler.writeOutput(
          { source: 'bundler source' },
          'outfile',
          'base URL', true, false);
      }).toNotThrow(/A bundle named/);

      expect(unlinkSpy.calls.length).toBe(1);
    });
  });
});
