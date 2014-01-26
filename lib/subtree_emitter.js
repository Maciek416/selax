var util = require('util');
var EventEmitter = require('events').EventEmitter;
var libxmljs = require('libxmljs');
var cssauron = require('cssauron');

var CSSAURON_SPEC = {
  tag: 'name',
  parent: 'parent',
  children: 'children',
  attr: 'attr(attr)'
};

var Node = require('./node');

var SubtreeEmitter = function(selector) {
  EventEmitter.call(this);

  this.parser = new libxmljs.SaxPushParser();
  this.selector = cssauron(CSSAURON_SPEC)(selector);

  this.subtree = null;

  this.parser.on('startElementNS', this.onStartElementNS.bind(this));
  this.parser.on('characters', this.onCharacters.bind(this));
  this.parser.on('cdata', this.onCDATA.bind(this));
  this.parser.on('endElementNS', this.onEndElementNS.bind(this));
};

util.inherits(SubtreeEmitter, EventEmitter);

SubtreeEmitter.prototype.push = function(chunk) {
  chunk = (typeof chunk === 'object' && chunk !== null) ? chunk.toString() : chunk;
  this.parser.push(chunk);
};

SubtreeEmitter.prototype.onStartElementNS = function(elem, attrs, prefix, uri, namespace) {
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
  node.parent = this.subtree;
  if(this.subtree) {
    this.subtree.children.push(node);
  }
  this.subtree = node;
};

SubtreeEmitter.prototype.onCharacters = function(text) {
  this.subtree.children.push(new Node({
    name: '#text',
    type: Node.TEXT_NODE,
    attrs: {},
    parent: this.subtree,
    children: [],
    value: text || ''
  }));
};

SubtreeEmitter.prototype.onCDATA = function(text) {
  this.subtree.children.push(new Node({
    name: '#cdata',
    type: Node.CDATA_SECTION_NODE,
    attrs: {},
    parent: this.subtree,
    children: [],
    value: text || ''
  }));
};

SubtreeEmitter.prototype.onEndElementNS = function(elem, prefix, uri) {
  if(this.selector(this.subtree)) {
    this.emit('data', this.subtree);
  }

  // Upon end of an element, crawl up the ancestry chain. If we've run dry of
  // ancestors, signal the end of the data stream with a null.
  if(this.subtree.parent) {
    this.subtree = this.subtree.parent;
  } else {
    this.emit('end');
  }
};

module.exports = SubtreeEmitter;