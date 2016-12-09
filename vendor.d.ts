declare module 'systemjs-builder' {
  import * as Promise from 'bluebird';

  let Builder: Builder.BuilderConstructor;
  namespace Builder {
    export interface BuilderConstructor {
      new (baseURL: string, cfg: any): BuilderInstance;
      new (baseURL: string): BuilderInstance;
    }

    export interface BuilderInstance {
      bundle(expressionOrTree: string | any, opts: any): Promise<Output>;
      trace(expressionOrTree: string | any, opts: any): Promise<any>;
      getDepCache(tree: any): any;
      getCanonicalName(fileUrl: string): string;
      config(config: any, saveForReset?: boolean, ignoreBaseURL?: boolean): void;
    }

    export interface Output {
      source: string;
      sourceMap: string;
      modules: string[];
    }
  }
  export = Builder;
}

declare module 'systemjs-builder/lib/utils.js' {
  let Utils: Utils.Utils;
  namespace Utils {
    export interface Utils {
      fromFileURL(url: string): string;
      toFileURL(path: string): string;
    }
  }
  export = Utils;
}

declare module 'rev-hash' {
  function revHash(buf: Buffer): string;
  namespace revHash {}
  export = revHash;
}

declare module 'rev-path' {
  function revPath(pth: string, hash: string): string;
  namespace revPath {
    export function revert(pth: string, hash: string): string;
  }
  export = revPath;
}

declare module 'globby' {
  function globby(pattern: string, opts: any): Promise<string[]>;
  namespace globby {
    export function sync(patterns: string[], opts: { cwd: string }): string[];
  }
  export = globby;
}
