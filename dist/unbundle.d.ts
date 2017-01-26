/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Config } from './models';
export declare function unbundle(cfg: Config): Promise<any[]>;
