export interface BundleOption {
    skip?: boolean;
    htmlimport?: boolean;
    baseURL?: string;
    bundleName?: string;
    includes: string[] | string;
    excludes?: string[];
    injectionConfigPath?: string;
    options: {
        inject: boolean | {
            indexFile: string;
            destFile: string;
        };
        minify: boolean;
        htmlminopts?: any;
        cssminopts?: any;
        rev?: boolean;
    };
}
export interface BundleConfig {
    force?: boolean;
    baseURL: string;
    configPath: string | string[];
    injectionConfigPath?: string;
    bundles: {
        [name: string]: BundleOption;
    };
    builderCfg?: any;
}
export declare function getOutFileName(source: any, fileName: any, rev: any): any;
export declare function validateConfig(config: BundleConfig): void;
export declare function getHTMLMinOpts(opts: any): {};
export declare function getCSSMinOpts(opts: any): {};
export declare function getBundleConfig(bundleCfg: any, bundleName: string, config: BundleConfig): BundleOption;
export declare function getHtmlImportBundleConfig(bundleCfg: any, bundleName: string, config: any): BundleOption;
export declare function getCommonConfig(config: any): any;
