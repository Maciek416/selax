var util = require('util');
var Transform = require('stream').Transform;
var cssauron = require('cssauron');
var libxmljs = require('libxmljs');

var Node = require('./node');

function Selax(selector) {
  Transform.call(this, {objectMode: true});

  this.bufferedNodes = [];
  this.selector = cssauron(Node.CSSAURON_SPEC)(selector);
  this.initializeSAXParser();
};

util.inherits(Selax, Transform);


Selax.prototype.initializeSAXParser = function() {
  this.parser = new libxmljs.SaxPushParser();

  var subtree = null;

  this.parser.on('startElementNS', function(elem, attrs, prefix, uri, namespace) {
    var attributes = attrs.reduce(function(acc, attr){
      // FIXME: XML namespace support. like-named attributes will clobber each other
      // 0 = attribute name
      // 1 = namespace name
      // 2 = namespace URL
      // 3 = value
      acc[attr[0]] = attr[3];
      return acc;
    }, {});

    var node = new Node({
      name: elem,
      type: Node.ELEMENT_NODE,
      attrs: attributes,
      parent: null,
      children: [],
      value: ''
    });

    // Connect to parent, add new node to children of parent.
    // If there's no established subtree, start a new one.
    node.parent = subtree;
    if(subtree){
      subtree.children.push(node);
    }
    subtree = node;
  });

  this.parser.on('characters', function(text){
    subtree.children.push(new Node({
      name: '#text',
      type: Node.TEXT_NODE,
      attrs: {},
      parent: subtree,
      children: [],
      value: text || ''
    }));
  });

  this.parser.on('cdata', function(text){
    subtree.children.push(new Node({
      name: '#cdata',
      type: Node.CDATA_SECTION_NODE,
      attrs: {},
      parent: subtree,
      children: [],
      value: text || ''
    }));
  });

  this.parser.on('endElementNS', function(elem, prefix, uri) {
    if(this.selector(subtree)) {
      this.buffer(subtree);
    }

    // Upon end of an element, crawl up the ancestry chain. If we've run dry of
    // ancestors, signal the end of the data stream with a null.
    if(subtree.parent) {
      subtree = subtree.parent;
    } else {
      this.buffer(null);
    }
  }.bind(this));

};

Selax.prototype.buffer = function(node) {
  this.bufferedNodes.push(node);
};

Selax.prototype.flush = function(callback){
  while(this.bufferedNodes.length > 0) {
    this.push(this.bufferedNodes.shift());
  }
  callback();
};

Selax.prototype._transform = function(chunk, encoding, callback) {
  chunk = (typeof chunk === 'object' && chunk !== null) ? chunk.toString() : chunk;
  this.parser.push(chunk);
  this.flush(callback);
};

Selax.prototype._flush = function(callback) {
  this.flush(callback);
};

module.exports = Selax;