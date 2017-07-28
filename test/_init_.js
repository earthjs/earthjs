window.d3    = require('d3');
window.test  = require('tape');
window.THREE = require('three');

require('../dist/earthjs');

window.tc = {
    oKeys: ['selector', 'rotate', 'transparent'],
    eKeys: ['_', '$slc', 'ready', 'register', 'create'],
    _: ['svg', 'drag', 'versor', 'center', 'options', 'ticker', 'scale', 'rotate', 'interval', 'refresh', 'resize', 'orthoGraphic', 'proj', 'path'],
    $slc: ['defs'],
}
