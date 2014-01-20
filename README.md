Selax
=====

[![NPM](https://nodei.co/npm/selax.png)](https://nodei.co/npm/selax/)

A library for streaming XML nodes matched with CSS3 selectors.

Selax implements node's `stream.Transform`, which means you can use it to `pipe()` data directly from a source like a file read stream, as well as listen to events like `readable` and `end`.

```javascript

// Stream temperature nodes from a met.no RSS weather data document (see: http://api.met.no/weatherapi/documentation )

var source = fs.createReadStream('weatherdata.rss');
var Selax = require('selax');

var ax = new Selax('weatherdata time:first-child temperature');

source.pipe(ax);

ax.on('readable', function(){
  var node;

  while(node = ax.read()){
    console.log('Found matching temperature node: ', node);
  }
});

ax.on('end', function(){
  console.log('Finished selecting temperature nodes');
});

```
