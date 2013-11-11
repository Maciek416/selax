var Node = function(options){
  for(var k in options){
    this[k] = options[k];
  }
};

Node.CSSAURON_SPEC = {
  tag: 'name',
  parent: 'parent',
  children: 'children',
  attr: 'attr(attr)'
};

Node.prototype.attr = function(attr) {
  return this.attrs[attr];
};

module.exports = Node;