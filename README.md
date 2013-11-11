Selax
=====

[![NPM](https://nodei.co/npm/selax.png)](https://nodei.co/npm/selax/)

A library for streaming XML nodes matched with CSS3 selectors.

```javascript

var Selax = require('selax');

var ax = new Selax('weatherdata time:first-child temperature');

ax.on('match', function(node){
  console.log('Found matching node: ', node);
});

ax.on('end', function(){
  console.log('Finished selecting nodes');
});

ax.write(xmlString);

```
