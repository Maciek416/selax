'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');

var fs = require('fs');
var Selax = require('../index');

var getXML = function(test){
  fs.readFile('./test/nasa.rss', function (errorMessage, xml) {
    if (errorMessage) {
      console.log(errorMessage);
      return;
    }
    xml = xml.toString();

    test(xml);
  });
};

describe('Selax', function() {

  describe('matching', function(){

    it('should find 10 item nodes in the XML file', function(done) {
      
      getXML(function(xml){
        var matched = [];
        var ax = new Selax('item');

        ax.on('match', function(node){
          matched.push(node);
        });

        ax.on('end', function(){
          matched.length.should.eql(10);
          done();
        });

        ax.write(xml);
      });

    });

    it('should parse text correctly', function(done) {
      getXML(function(xml){
        var ax = new Selax('channel > description');

        ax.on('match', function(node){
          node.text().should.eql('A RSS news feed containing the latest NASA news articles and press releases.');
          done();
        });

        ax.write(xml);
      });
    });

  });

});
