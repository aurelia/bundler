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

declare var Builder: SystemBuilder.Builder;
declare var Utils: SystemBuilder.Utils;

declare function revHash(buf: Buffer): string;
declare function revPath(pth: string, hash: string): string;

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
