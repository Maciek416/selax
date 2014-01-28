Selax
=====

[![NPM](https://nodei.co/npm/selax.png)](https://nodei.co/npm/selax/)

A module for streaming XML nodes matched with CSS3 selectors using a `through` stream. Pipe XML data directly out of a file or network connection into Selax and capture the nodes you want with a CSS3 selector pattern.

Example
-------

```javascript

// Stream temperature nodes from a met.no RSS weather data document (see: http://api.met.no/weatherapi/documentation )

var source = fs.createReadStream('weatherdata.rss');
var selax = require('selax');

var ax = selax('weatherdata time:first-child temperature');

source.pipe(ax);

ax.on('readable', function() {
  var node;

  while(node = ax.read()) {
    console.log('Found matching temperature node: ', node);
  }
});

ax.on('end', function() {
  console.log('Finished selecting temperature nodes');
});

```

Notes
-----

Selax is based on `libxml2js` and emits node objects as plain Javascript objects. Nodes have a `type`, `name`, a `children` array and an `attr(name)` function for reading attributes.
