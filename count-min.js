"use strict"

var defaultHash = require("k-hash")

function CountMinSketch(width, depth, hashFunc) {
  this.width = width
  this.depth = depth
  this.hashFunc = hashFunc
  this.table = new Uint32Array(width * depth)
  var scratch
  var table
  if(typeof Uint32Array === undefined) {
    table = new Array(width * depth)
    for(var i=0, n=table.length; i<n; ++i) {
      table[i] = 0
    }
    scratch = new Array(depth)
    for(var i=0; i<depth; ++i) {
      scratch[i] = 0
    }
  } else {
    table = new Uint32Array(width * depth)
    scratch = new Uint32Array(depth)
  }
  this.table = table
  this.scratch = scratch
}

var proto = CountMinSketch.prototype

proto.update = function(key, v) {
  var scratch = this.scratch
  var d = this.depth
  var w = this.width
  var tab = this.table
  var ptr = 0
  this.hashFunc(key, scratch)
  for(var i=0; i<d; ++i) {
    tab[ptr + (scratch[i] % w)] += v
    ptr += w
  }
}

proto.query = function(key) {
  var scratch = this.scratch
  var d = this.depth
  var w = this.width
  var tab = this.table
  var ptr = w
  this.hashFunc(key, scratch)
  var r = tab[scratch[0]%w]
  for(var i=1; i<d; ++i) {
    r = Math.min(r, tab[ptr + (scratch[i]%w)])
    ptr += w
  }
  return r
}

function createCountMinSketch(accuracy, probIncorrect, hashFunc) {
  accuracy = accuracy || 0.1
  probIncorrect = probIncorrect || 0.0001
  hashFunc = hashFunc || defaultHash
  var width = Math.ceil(Math.E / accuracy)|0
  var depth = Math.ceil(-Math.log(probIncorrect))|0
  return new CountMinSketch(width, depth, hashFunc)
}

module.exports = createCountMinSketch