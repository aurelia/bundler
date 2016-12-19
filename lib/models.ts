export type FetchHook = (load: any, fetch: (load: any) => any) => void;
export type Inject = { indexFile: string, destFile: string };

export type ConfigBody = {
  skip?: boolean;
  htmlimport?: boolean;
  includes: string[] | string;
  excludes: string[];
  injectionConfigPath?: string;
  options: {
    inject: boolean | Inject
    sourceMaps: boolean,
    depCache: boolean,
    minify: boolean,
    htmlminopts?: any,
    cssminopts?: any,
    rev?: boolean,
    fetch: FetchHook
  };
};

export type  ConfigHeader = {
  force?: boolean;
  baseURL: string;
  configPath: string | string[];
  injectionConfigPath?: string;
  builderCfg?: any;
};

export type Config = ConfigHeader  & { bundles: {[name: string]: ConfigBody }};
export type BundleConfig = ConfigHeader & ConfigBody & { bundleName: string };
export interface SystemConfig {
  defaultJSExtensions: boolean;
  baseURL: string;
  map: any;
  depCache: any;
  bundles: any;
};
