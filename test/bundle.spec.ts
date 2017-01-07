import * as sysUtil from 'systemjs-builder/lib/utils.js';
import * as fs from 'fs';
import * as chai from 'chai';
import {BundleConfig} from '../lib/models';
import * as sinon from 'sinon';
import * as sinonChi from 'sinon-chai';
import * as bundler from '../lib/bundler';
import * as Builder from 'systemjs-builder';
import * as serializer from '../lib/config-serializer';

let expect = chai.expect;
chai.use(sinonChi);

describe('inject bundle', () => {
  let sandbox: sinon.SinonSandbox; 
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('saves bundle config to disk', () => {
    let appCfg = { bundles: {} };
    let configPath = '';

    sandbox.stub(serializer, 'saveAppConfig')
    sandbox.stub(serializer, 'getAppConfig').returns(appCfg);
    sandbox.stub(sysUtil, 'toFileURL');

    let cfg = {
      baseURL: '',
      options: {
        injectionConfigPath: configPath
      }
    };

    let builder = new Builder('.');
    sandbox.stub(builder, 'getCanonicalName');

    let output = { modules: [], source: '', sourceMap: '' };
    let outfile = '';

    bundler.injectBundle(builder, output, outfile, cfg as any as  BundleConfig);
    expect(serializer.saveAppConfig).to.have.been.calledOnce;
  });
});

describe('write bundle output', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('writes the bundle file to disk', () => {
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(fs, 'mkdirSync');
    bundler.writeOutput({ source: 'sdfsdf', sourceMap: '', modules: [] }, 'outfile.js', true, false);
    expect(fs.writeFileSync).to.have.been.calledOnce;
  });

  it('creates output directory when not exists', () => {
    sandbox.stub(fs, 'mkdirSync');
    sandbox.stub(fs, 'existsSync').returns(false);
    sandbox.stub(fs, 'writeFileSync');

    bundler.writeOutput(
       { source: 'bundler source', sourceMap: '', modules: [] },
       'outfile', true, false);
    expect(fs.mkdirSync).to.have.been.calledOnce;
  });

  describe('given out file exits', () => {
    it('does not overwrite the out file', () => {
      sandbox.stub(fs, 'existsSync').returns(true);
      sandbox.stub(fs, 'writeFileSync');
      expect(() => {
        bundler.writeOutput(
          { source: 'bundler source', sourceMap: '', modules: [] },
          'outfile.js',false, false);
      }).to.throw(/A bundle named/);

      expect(fs.writeFileSync).to.not.have.been.calledOnce;
    });

    it('removes the existing file when `force` option is supplied', () => {
      sandbox.stub(fs, 'existsSync').returns(true);
      sandbox.spy(fs, 'unlinkSync');
      sandbox.stub(fs, 'writeFileSync');

      expect(() => {
        bundler.writeOutput({ source: 'bundler source', sourceMap: '', modules: [] },
          'outfile.js', true, false);
      }).to.not.throw(/A bundle named/);

      expect(fs.unlinkSync).to.have.been.calledOnce;
    });
  });
});