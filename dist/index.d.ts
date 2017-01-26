/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Config } from './models';
export * from './unbundle';
export declare function bundle(inpConfig: Config): Promise<any[]>;
export declare function depCache(bundleConfig: Config): Promise<any[]>;
