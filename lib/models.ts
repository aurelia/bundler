export type FetchHook = (load: any, fetch: (load: any) => any) => void;

export type ConfigBody = {
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
    sourceMaps: boolean,
    depCache: boolean,
    minify: boolean,
    htmlminopts?: any,
    cssminopts?: any,
    rev?: boolean,
    fetch: FetchHook
  };
}

export type  ConfigHeader = {
  force?: boolean;
  baseURL: string;
  configPath: string | string[];
  injectionConfigPath?: string;
  builderCfg?: any;
}

export type BundleConfig = ConfigHeader & ConfigBody & { bundleName: string };

export type Config = ConfigHeader  & { bundles: {[name: string]: ConfigBody }};