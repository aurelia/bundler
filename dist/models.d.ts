export declare type FetchHook = (load: any, fetch: (load: any) => any) => void;
export declare type Inject = {
    indexFile: string;
    destFile: string;
};
export declare type ConfigBody = {
    skip?: boolean;
    htmlimport?: boolean;
    includes: string[] | string;
    excludes: string[];
    options: {
        inject: boolean | Inject;
        sourceMaps: boolean | string;
        depCache: boolean;
        minify: boolean;
        htmlminopts?: any;
        cssminopts?: any;
        rev?: boolean;
        fetch: FetchHook;
    };
};
export declare type ConfigHeader = {
    force?: boolean;
    baseURL: string;
    outputPath?: string;
    configPath: string | string[];
    injectionConfigPath?: string;
    builderCfg?: any;
};
export declare type Config = ConfigHeader & {
    bundles: {
        [name: string]: ConfigBody;
    };
};
export declare type BundleConfig = ConfigHeader & ConfigBody & {
    bundleName: string;
};
export interface SystemConfig {
    defaultJSExtensions: boolean;
    baseURL: string;
    map: any;
    depCache: any;
    bundles: any;
    packages?: any;
}
