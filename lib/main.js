var SubtreeEmitter = require('./subtree_emitter');
var through = require('through2');

module.exports = function(selector) {

  var buffer = [];
  var emitter = new SubtreeEmitter(selector);

  var push = function(node) {
    buffer.push(node);
  };

  var drain = function(callback, stream) {
    while(buffer.length > 0)
      stream.push(buffer.shift());

    callback();
  };

  var transform = function(chunk, encoding, callback) {
    emitter.push(chunk);
    drain(callback, this);
  };

  var flush = function(callback) {
    drain(callback, this);
  };

  // incoming matched nodes
  emitter.on('data', push);
  emitter.on('end', push.bind(this, null));

  return through.obj({objectMode: true}, transform, flush);
};