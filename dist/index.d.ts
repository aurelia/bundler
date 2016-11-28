/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { BundleConfig } from './utils';
export * from './unbundle';
export declare function bundle(bundleConfig: BundleConfig): Promise<void[]>;
export declare function depCache(bundleConfig: BundleConfig): Promise<void[]>;
