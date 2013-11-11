var util = require('util');
var events = require('events');
var cssauron = require('cssauron');
var libxmljs = require('libxmljs');

var Node = require('./node');

function Selax(selector) {
  events.EventEmitter.call(this);

  this.selector = cssauron(Node.CSSAURON_SPEC)(selector);
  this.reset();
};

util.inherits(Selax, events.EventEmitter);


Selax.prototype.reset = function() {
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

  this.parser.on('endElementNS', function(elem, prefix, uri) {
    if(this.selector(subtree)) {
      this.emit('match', subtree);
    }

    // Upon end of an element, crawl up the ancestry chain.
    // If we've run dry of ancestors, emit 'end' instead.
    if(subtree.parent) {
      subtree = subtree.parent;
    } else {
      this.emit('end', subtree);
    }
  }.bind(this));
};

Selax.prototype.write = function(data) {
  this.parser.push(data);
};

module.exports = Selax;