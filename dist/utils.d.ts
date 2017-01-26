import { Config, BundleConfig, ConfigBody, ConfigHeader } from './models';
export declare function getOutFileName(source: string, fileName: string, rev: boolean): string;
export declare function validateConfig(config: Config): void;
export declare function getHTMLMinOpts(opts: any): {};
export declare function getCSSMinOpts(opts: any): {};
export declare function getBundleConfig(bundleCfg: ConfigBody, bundleName: string, config: Config): BundleConfig;
export declare function getHtmlImportBundleConfig(bundleCfg: ConfigBody, bundleName: string, config: ConfigHeader): BundleConfig;
export declare function ensureDefaults(config: Config): Config;
