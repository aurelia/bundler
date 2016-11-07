export interface AppConfig {
    baseURL: string;
    map: any;
    depCache: any;
    bundles: any;
}
export declare function readConfig(cfgCode: any): AppConfig;
export declare function isSystemJS(cfgCode: any): boolean;
export declare function isSystem(cfgCode: any): boolean;
export declare function serializeConfig(config: any, isSystemJS: any): string;
export declare function getAppConfig(configPath: any): AppConfig;
export declare function saveAppConfig(configPath: any, config: any): void;
