import  { expect }  from 'chai';
import { getFullModuleName } from '../lib/bundler';
import  config  from './config';

describe('getFullModuleName', () => {
  it('is defined', () => {
    expect(getFullModuleName).to.exist;
  });

  it('config has map defined', () => {
    expect(config.map).to.exist;
  });

  it('returns the match immediately when exact match is found', () => {
    let moduleName = 'github:aurelia/framework@0.17.0';
    let match = getFullModuleName(moduleName, config.map);
    expect(match).to.be.equal(moduleName);

    moduleName = 'font-awesome';
    match = getFullModuleName(moduleName, config.map);
    expect(match).to.be.equal(moduleName);
  });

  it('returns full module name with version when module name is specified without registry and version number', () => {
    let fullName = 'github:aurelia/framework@0.17.0';
    let match = getFullModuleName('aurelia/framework', config.map);
    expect(match).to.be.equal(fullName);
  });

  it('returns configured/specified module-name/pattern itself when no match found', () => {
    let name = '[*]';
    let match = getFullModuleName(name, config.map);
    expect(match).to.be.equal(name);

    name = 'app/**/**';
    match = getFullModuleName(name, config.map);
    expect(match).to.be.equal(name);
  });

  it('throws error when multiple match found', () => {
    let moduleName = 'util';
    let fn = getFullModuleName.bind(undefined, moduleName, config.map);
    expect(fn).to.throw(/A version conflict was found among the module names specified/);
  });
});
