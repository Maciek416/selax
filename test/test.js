'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');

var fs = require('fs');
var Selax = require('../index');

describe('Selax', function() {

  describe('parsing and matching', function(){

    it('should find 10 item nodes in the XML file', function(done) {

      fs.readFile('./test/nasa.rss', function (errorMessage, xml) {
        if (errorMessage) {
          console.log(errorMessage);
          return;
        }
        xml = xml.toString();

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
  });
});
