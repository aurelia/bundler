import expect  from 'expect';
import { writeOutput, __RewireAPI__ as bundler} from '../lib/bundler';
import { config } from './config.js';

let fs = {
   existsSync: function(path){
   },
   unlinkSync: function(path){
   },
   writeFileSync: function(path, string){
   },
   mkdirSync: function(path){
   }
};

let path = {
   dirname: function(path) {
   },
   resolve: function(path1, path2) {
   },
};

bundler.__Rewire__('fs', fs);
bundler.__Rewire__('path', path);

describe('write bundle output', ()=> {
  it('writes the bundler file to disk', ()=> {
     let spy = expect.spyOn(path, 'resolve');
     writeOutput({source: 'sdfsdf'}, 'the outfile', 'the base URL', true);
     expect(spy.calls.length).toBe(1);
  });

  it('creates output directory when not exists', ()=> {
     let spy = expect.spyOn(fs, 'mkdirSync');
     fs.existsSync = expect.createSpy(fs.existsSync).andReturn(false);

     writeOutput({source: 'bundler source'}, 'outfile', 'base URL', true);
     expect(spy.calls.length).toBe(1);
  });
});
