declare module 'systemjs-builder' {
  export = Builder;
}

declare module 'systemjs-builder/lib/utils.js' {
  export = Utils;
}

declare module 'rev-hash' {
  export = revHash;
}

declare module 'rev-path' {
  export = revPath;
}

declare module 'globby' {
  export = globby;
}

declare function revHash(buf: Buffer): string;
declare namespace revHash {
}

declare function revPath(pth: string, hash: string): string;
declare namespace revPath {
  export function revert(pth: string, hash: string): string;
}

declare function globby(pattern: string, opts: any): Promise<string[]>;
declare namespace globby {
  export function sync(patterns: string[], opts: {cwd: string}): string[];
}

declare var Builder: SystemBuilder.Builder;
declare var Utils: SystemBuilder.Utils;

declare namespace SystemBuilder {
  export interface Builder {
    new (baseURL: string, cfg: any);
    new (baseURL: string);
    bundle(expressionOrTree: string | any, opts: any): Promise<Output>;
    trace(expressionOrTree: string | any, opts: any): Promise<any>;
    getDepCache(tree: any): any;
    getCanonicalName(): string;
    config(config: any, saveForReset?: boolean, ignoreBaseURL?: boolean);
  }

  export interface Utils {
    fromFileURL(url: string): string;
    toFileURL(path: string): string;
  }

  interface Output {
    source: string;
    sourceMaps: string;
  }
}
