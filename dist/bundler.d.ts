/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare function bundle(cfg: any): Promise<any[]>;
export declare function depCache(cfg: any): any;
export declare function writeSourcemaps(output: any, outfile: any, baseURL: any, force: any): void;
export declare function writeOutput(output: any, outfile: any, baseURL: any, force: any, sourceMaps: any): void;
export declare function injectBundle(builder: any, output: any, outfile: any, cfg: any): void;
export declare function getFullModuleName(moduleName: any, map: any): any;
