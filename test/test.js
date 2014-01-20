'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');

var fs = require('fs');
var Selax = require('../index');
var filename = './test/nasa.rss';

describe('Selax', function() {

  describe('matching', function() {

    it('should find 10 item nodes in the XML file', function(done) {

      var matched = [];
      var ax = new Selax('item');
      var source = fs.createReadStream(filename);

      source.pipe(ax);

      ax.on('readable', function() {
        var item;
        while(item = ax.read()){
          matched.push(item);
        }
      });

      ax.on('end', function() {
        matched.length.should.eql(10);
        done();
      });
      
    });

    it('should parse text correctly', function(done) {
      var ax = new Selax('channel > description');
      var source = fs.createReadStream(filename);

      source.pipe(ax);

      ax.on('data', function(node){
        node.text().should.eql('A RSS news feed containing the latest NASA news articles and press releases.');
        ax.end();
        done();
      });
    });

  });

});
