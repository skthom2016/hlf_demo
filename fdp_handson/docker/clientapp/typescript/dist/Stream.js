"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
class Stream extends stream.Transform {
    constructor() {
        super();
        this.lastLineData = '';
        this.objectMode = true;
    }
}
exports.Stream = Stream;
//# sourceMappingURL=Stream.js.map