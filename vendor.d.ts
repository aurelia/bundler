
declare var Builder: Builder.BuilderConstructor;

declare namespace Builder {
  export interface BuilderConstructor {
    new(baseURL: string, cfg: any): BuilderInstance;
    new(baseURL: string): Builder;
  }
  export interface BuilderInstance {
    bundle(expressionOrTree: string | any, opts: any): Promise<Output>;
    trace(expressionOrTree: string | any, opts: any): Promise<any>;
    getDepCache(tree: any): any;
    getCanonicalName(): string;
    config(config: any, saveForReset?: boolean, ignoreBaseURL?: boolean);
  }

  export interface Output {
    source: string;
    sourceMaps: string;
  }
}

declare module 'systemjs-builder' {
  export = Builder;
}

declare module 'systemjs-builder/lib/utils.js' {
  export = Utils;
}

declare var Utils: SystemBuilder.Utils;

export interface Utils {
  fromFileURL(url: string): string;
  toFileURL(path: string): string;
}

declare module 'rev-hash' {
  export = revHash;
}

declare namespace revHash {
}
declare function revHash(buf: Buffer): string;

declare module 'rev-path' {
  export = revPath;
}

declare function revPath(pth: string, hash: string): string;

declare namespace revPath {
  export function revert(pth: string, hash: string): string;
}

declare module 'globby' {
  export = globby;
}

declare function globby(pattern: string, opts: any): Promise<string[]>;

declare namespace globby {
  export function sync(patterns: string[], opts: {cwd: string}): string[];
}
