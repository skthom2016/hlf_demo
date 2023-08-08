import * as stream from 'stream';

export class Stream extends stream.Transform {

  lastLineData = '';
  objectMode = true;

  constructor() {
    super();

  }
}