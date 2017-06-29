/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as Builder from 'systemjs-builder';
import { BundleConfig } from "./models";
export declare function bundle(cfg: BundleConfig): Promise<any[]>;
export declare function depCache(cfg: BundleConfig): Promise<any>;
export declare function writeSourcemaps(output: Builder.Output, outPath: string, force: boolean): void;
export declare function writeOutput(output: Builder.Output, outPath: string, force: boolean, sourceMap: boolean | string): void;
export declare function injectBundle(builder: Builder.BuilderInstance, output: Builder.Output, outfile: string, cfg: BundleConfig): void;
export declare function getFullModuleName(moduleName: string, map: any): string;
