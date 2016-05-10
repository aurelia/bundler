import expect  from 'expect';
import {writeOutput, injectBundle, __RewireAPI__ as bundler} from '../lib/bundler';

let fs = {
  existsSync: function (path) { },
  unlinkSync: function (path) { },
  writeFileSync: function (path, string) { },
  mkdirSync: function (path) { }
};

let path = {
  dirname: function (path) { },
  resolve: function (path1, path2) { },
};

bundler.__Rewire__('fs', fs);
bundler.__Rewire__('path', path);

describe('inject bundle', () => {

  it('saves bundle config to disk', () => {
    
    let appCfg = { bundles: {} };
    let configPath = '';
    
    let saveAppConfigSpy = expect.createSpy((cfgPath, appCfg) => { });
    let getAppConfigSpy = expect.createSpy(configPath => { }).andReturn(appCfg);
    let toFileURLSpy = expect.createSpy(filePath => filePath);

    bundler.__Rewire__('saveAppConfig', saveAppConfigSpy);
    bundler.__Rewire__('getAppConfig', getAppConfigSpy);
    bundler.__Rewire__('toFileURL', toFileURLSpy);

    let cfg = {
      baseURL: '',
      options: {
        injectionCofigPath: configPath
      }
    };

    let builder = {
      getCanonicalName: function () { }
    };

    let output = { modules: [] };
    let outfile = '';

    injectBundle(builder, output, outfile, cfg);
    expect(saveAppConfigSpy).toHaveBeenCalled();

    bundler.__ResetDependency__('saveAppConfig');
  });
});

describe('write bundle output', () => {
  it('writes the bundler file to disk', () => {
    let spy = expect.spyOn(path, 'resolve');
    writeOutput({ source: 'sdfsdf' }, 'the outfile', 'the base URL', true);
    expect(spy.calls.length).toBe(1);
  });

  it('creates output directory when not exists', () => {
    let spy = expect.spyOn(fs, 'mkdirSync');
    fs.existsSync = expect.createSpy(fs.existsSync).andReturn(false);

    writeOutput({ source: 'bundler source' }, 'outfile', 'base URL', true);
    expect(spy.calls.length).toBe(1);
  });

  describe('given out file exits', () => {
    it('does not overwrite the out file', () => {
      let spy = expect.createSpy(fs.existsSync).andReturn(true);
      fs.existsSync = spy;

      expect(_ => {
        writeOutput(
          { source: 'bundler source' },
          'outfile',
          'base URL', false)
      }).toThrow(/A bundle named/);

      expect(spy.calls.length).toBe(1);
    });

    it('removes the existing file when `force` option is supplied', () => {
      let spy = expect.createSpy(fs.existsSync).andReturn(true);
      fs.existsSync = spy;

      let unlinkSpy = expect.spyOn(fs, 'unlinkSync');

      expect(_ => {
        writeOutput(
          { source: 'bundler source' },
          'outfile',
          'base URL', true)
      }).toNotThrow(/A bundle named/);

      expect(unlinkSpy.calls.length).toBe(1);
    });
  });

});
