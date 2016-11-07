/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export * from './unbundle';
export declare function bundle(bundleConfig: any): Promise<void[]>;
export declare function depCache(bundleConfig: any): Promise<never[]>;
