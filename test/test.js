'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');

var fs = require('fs');
var Selax = require('../index');
var smallfile = './test/nasa.rss';
var largefile = './test/oregon.gpx';

describe('Selax', function() {

  describe('matching', function() {

    it('should find 10 item nodes in the XML file', function(done) {

      var matched = [];
      var ax = Selax('item');
      var source = fs.createReadStream(smallfile);

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
      var ax = Selax('channel > description');
      var source = fs.createReadStream(smallfile);

      source.pipe(ax);

      ax.on('data', function(node){
        node.text().should.eql('A RSS news feed containing the latest NASA news articles and press releases.');
        ax.end();
        done();
      });
    });

    it('should find many matched nodes in a large XML file', function(done) {
      var ax = new Selax('trkpt');
      fs.createReadStream(largefile).pipe(ax);

      var nodeCount = 0;

      ax.on('readable', function(){
        while(ax.read()) nodeCount++;
      });

      ax.on('end', function(){
        nodeCount.should.eql(1443);
        done();
      });
    });

  });

});
