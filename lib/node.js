var Node = function(options) {
  for(var k in options) {
    this[k] = options[k];
  }
};

// Match the node types of DOM.
Node.ELEMENT_NODE = 1;
Node.TEXT_NODE = 3;
Node.CDATA_SECTION_NODE = 4;

Node.CSSAURON_SPEC = {
  tag: 'name',
  parent: 'parent',
  children: 'children',
  attr: 'attr(attr)'
};

Node.prototype.attr = function(attr) {
  return this.attrs[attr];
};

Node.prototype.text = function() {
  if(this.type === Node.TEXT_NODE || this.type === Node.CDATA_SECTION_NODE) {
    return this.value;
  } else {
    return this.children.map(function(child){
      return child.text();
    }).join('');
  }
};

module.exports = Node;