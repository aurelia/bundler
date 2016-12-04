export type FetchHook = (load: any, fetch: (load: any) => any) => void;

export interface ConfigBody {
  skip?: boolean;
  htmlimport?: boolean;
  bundleName?: string;
  includes: string[] | string;
  excludes: string[];
  injectionConfigPath?: string;
  options: {
    inject: boolean | {
      indexFile: string,
      destFile: string
    },
    depCache: boolean,
    minify: boolean,
    htmlminopts?: any,
    cssminopts?: any,
    rev?: boolean,
    fetch: FetchHook
  };
}

export interface ConfigHeader {
  force?: boolean;
  baseURL: string;
  configPath: string | string[];
  injectionConfigPath?: string;
  builderCfg?: any;
}

export type BundleConfig = ConfigHeader & ConfigBody & { bundleName: string };

export type Config = ConfigHeader  & { bundles: {[name: string]: ConfigBody }}
