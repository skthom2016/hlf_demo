/// <reference types="node" />
import * as stream from 'stream';
export declare class Stream extends stream.Transform {
    lastLineData: string;
    objectMode: boolean;
    constructor();
}
