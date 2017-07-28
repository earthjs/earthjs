window.require && require('./_init_');

test(`a test`, function (t) {
    t.equal(1,1);
    t.ok(true);
    t.end();
});

test(`add svg#earth-js, SVG node eq===1`, function (t) {
    var $body = d3.selectAll('body');
    $body.selectAll('svg').remove();
    $body.append('svg').attr('id','earth-js');
    t.equal(d3.selectAll('svg').nodes().length,1);
    t.end();
});

test(`typeof d3.earthjs(), return 'function'.`, function(t) {
    t.equal(typeof d3.earthjs, 'function');
    t.end();
});

test(`g = d3.earthjs()`, function(t) {
    var g = d3.earthjs();
    test(`g namespace eq===${tc.eKeys.length}`, function(q) {
        var length = Object.keys(g).length;
        q.equal(length, tc.eKeys.length);
        q.end();
    });
    test(`g keys: [${tc.eKeys}]`, function(q) {
        var keys = Object.keys(g)
        q.equal(keys.filter(k=>(tc.eKeys.indexOf(k)>-1)).length, tc.eKeys.length);
        q.end();
    });
    test(`g._ namespace eq===${tc._.length}`, function(q) {
        var length = Object.keys(g._).length;
        q.equal(length, tc._.length);
        q.end();
    });
    test(`g._ keys: [${tc._}]`, function(q) {
        var keys = Object.keys(g._)
        q.equal(keys.filter(k=>(tc._.indexOf(k)>-1)).length, tc._.length);
        q.end();
    });
    test(`g.$slc namespace eq===${tc.$slc.length}`, function(q) {
        var length = Object.keys(g.$slc).length;
        q.equal(length, tc.$slc.length);
        q.end();
    });
    test(`g.$slc keys: [${tc.$slc}]`, function(q) {
        var keys = Object.keys(g.$slc)
        q.equal(keys.filter(k=>(tc.$slc.indexOf(k)>-1)).length, tc.$slc.length);
        q.end();
    });
    test(`g._.svg nodes eq===1`, function(q) {
        q.equal(g._.svg.nodes().length, 1);
        q.end();
    })
    test(`g._.drag eq===false`, function(q) {
        q.equal(g._.drag, false);
        q.end();
    })
    test(`g._.options keys: [${tc.oKeys}]`, function(q) {
        var keys = Object.keys(g._.options)
        q.equal(keys.filter(k=>(tc.oKeys.indexOf(k)>-1)).length, tc.oKeys.length);
        q.end();
    });
    test(`g._.options keys: [${tc.oKeys}]`, function(q) {
        var keys = Object.keys(g._.options)
        q.equal(keys.filter(k=>(tc.oKeys.indexOf(k)>-1)).length, tc.oKeys.length);
        q.end();
    });
    t.end();
});
