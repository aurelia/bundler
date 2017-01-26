/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as Builder from 'systemjs-builder';
import { BundleConfig } from './models';
export declare function bundle(cfg: BundleConfig): Promise<void>;
export declare function generateOutput(baseURL: string, includes: string[], builder: Builder.BuilderInstance): string;
export declare function getOutputFileName(baseURL: string, bundleName: string, output: string, rev: boolean): string;
