import  expect  from 'expect';
import { getFullModuleName } from '../lib/bundler';
import  config  from './config.js';

describe('getFullModuleName', () => {
  it('is defined', () => {
    expect(getFullModuleName).toExist();
  });

  it('config has map defined', () => {
    expect(config.map).toExist();
  });

  it('returns the match immediately when exact match is found', () => {
    let moduleName = 'github:aurelia/framework@0.17.0';
    let match = getFullModuleName(moduleName, config.map);
    expect(match).toBe(moduleName);

    moduleName = 'font-awesome';
    match = getFullModuleName(moduleName, config.map);
    expect(match).toBe(moduleName);
  });


  it('returns full module name with version when module name is specified without registry and version number', () => {
    let fullName = 'github:aurelia/framework@0.17.0';
    let match = getFullModuleName('aurelia/framework', config.map);
    expect(match).toBe(fullName);
  });

  it('returns configured/specified module-name/pattern itself when no match found', () => {
    let name = '[*]';
    let match = getFullModuleName(name, config.map);
    expect(match).toBe(name);

    name = 'app/**/**';
    match = getFullModuleName(name, config.map);
    expect(match).toBe(name);
  });

  it('throws error when multiple match found', () => {
    let moduleName = 'util';
    let fn = getFullModuleName.bind(undefined, moduleName, config.map);
    expect(fn).toThrow(/A version conflict was found among the module names specified/);
  });
});
