import { SystemConfig } from './models';
export declare function readConfig(cfgCode: string[]): SystemConfig;
export declare function isSystemJS(cfgCode: string): boolean;
export declare function isSystem(cfgCode: string): boolean;
export declare function serializeConfig(config: SystemConfig, isSystemJS?: boolean): string;
export declare function getAppConfig(configPath: string | string[]): SystemConfig;
export declare function saveAppConfig(configPath: string, config: SystemConfig): void;
