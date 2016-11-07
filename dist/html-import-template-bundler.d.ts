/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare function bundle(cfg: any): Promise<void>;
export declare function generateOutput(baseURL: any, includes: any, builder: any): string;
export declare function getOutputFileName(baseURL: any, bundleName: any, output: any, rev: any): string;
