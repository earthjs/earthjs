import versorFn from './versor.js';

var versor = versorFn();
var earthjs = function (options) {
    if ( options === void 0 ) options={};

    /*eslint no-console: 0 */
    cancelAnimationFrame(earthjs.ticker);
    options = Object.assign({
        svgCanvasSelector: '.ej-svg,.ej-canvas',
        selector: '#earth-js',
        rotate: [130,-33,-11],
        transparent: false,
        map: false,
        padding: 0
    }, options);
    var _ = {
        onCreate: {},
        onCreateVals: [],

        onRefresh: {},
        onRefreshVals: [],

        onResize: {},
        onResizeVals: [],

        onInterval: {},
        onIntervalVals: [],

        onTween: {},
        onTweenVals: [],

        ready: null,
        promeses: [],
        loadingData: null,
        recreateSvgOrCanvas: function() {
            _.onCreateVals.forEach(function(fn) {
                fn.call(globe);
            });
            return globe;
        }
    }
    window._ = _;
    var drag = false;
    var svg = d3.selectAll(options.selector);
    var width = +svg.attr('width'), height = +svg.attr('height');
    if (!width || !height) {
        width = options.width || 700;
        height = options.height || 500;
        svg.attr('width', width).attr('height', height);
    }
    d3.selectAll(options.svgCanvasSelector)
        .attr('width', width).attr('height',height);
    var center = [width/2, height/2];
    Object.defineProperty(options, 'width', {
        get: function () { return width; },
        set: function (x) {
            width = x;
            center[0] = x/2;
        }
    });
    Object.defineProperty(options, 'height', {
        get: function () { return height; },
        set: function (x) {
            height = x;
            center[1] = x/2;
        }
    });
    var globe = {
        _: {
            svg: svg,
            drag: drag,
            versor: versor,
            center: center,
            options: options,
        },
        $slc: {},
        ready: function ready(fn) {
            if (fn) {
                globe._.readyFn = fn;
                globe._.promeses = _.promeses;
                if (_.promeses.length>0) {
                    var q = d3.queue();
                    _.loadingData = true;
                    _.promeses.forEach(function (obj) {
                        obj.urls.forEach(function (url) {
                            var ext = url.split('.').pop();
                            if (ext==='geojson') {
                                ext = 'json';
                            }
                            q.defer(d3[ext], url);
                        });
                    })
                    q.await(function() {
                        var args = [].slice.call(arguments);
                        var err = args.shift();
                        _.promeses.forEach(function (obj) {
                            var ln = obj.urls.length;
                            var ar = args.slice(0,ln);
                            var ready = globe[obj.name].ready;
                            ar.unshift(err);

                            if (ready) {
                                ready.apply(globe, ar);
                            } else {
                                obj.onReady.apply(globe, ar);
                            }
                            args = args.slice(ln);
                        });
                        _.loadingData = false;
                        fn.called = true;
                        fn.call(globe);
                    });
                }
            } else if (arguments.length===0) {
                return _.loadingData;
            }
        },
        register: function register(obj, name) {
            var ar = {name: name || obj.name, __on__:{}};
            globe[ar.name] = ar;
            Object.keys(obj).forEach(function(fn) {
                if ([
                    'urls',
                    'onReady',
                    'onInit',
                    'onTween',
                    'onCreate',
                    'onResize',
                    'onRefresh',
                    'onInterval'].indexOf(fn)===-1) {
                    if (typeof(obj[fn])==='function') {
                        ar[fn] = function() {
                            return obj[fn].apply(globe, arguments);
                        }
                    }
                }
            });
            if (obj.onInit) {
                obj.onInit.call(globe, ar);
            }
            qEvent(obj,'onTween', ar.name);
            qEvent(obj,'onCreate', ar.name);
            qEvent(obj,'onResize', ar.name);
            qEvent(obj,'onRefresh', ar.name);
            qEvent(obj,'onInterval', ar.name);
            if (obj.urls && obj.onReady) {
                _.promeses.push({
                    name: ar.name,
                    urls: obj.urls,
                    onReady: obj.onReady
                });
            }
            return globe;
        }
    }
    Object.defineProperty(globe, 'loading', {
        get: function () { return _.loadingData; },
    });

    //----------------------------------------
    var earths = [];
    var ticker = null;
    var __ = globe._;

    globe.create = function(twinEarth) {
        earths = twinEarth || [];
        _.recreateSvgOrCanvas();
        earths.forEach(function(p) {
            p.create(null);
        });
        if (ticker===null && earths!==[]) {
            __.ticker();
        }
        return globe;
    }

    globe.$slc.defs = __.svg.append('defs');
    __.ticker = function(intervalTicker) {
        var interval = __.interval;
        intervalTicker = intervalTicker || 10;

        var start1 = 0;
        var start2 = 0;
        function step(timestamp) {
            if ((timestamp - start1) > intervalTicker) {
                start1 = timestamp;
                if (!_.loadingData) {
                    interval.call(globe, timestamp);
                    if ((timestamp - start2) > intervalTicker+30) {
                        start2 = timestamp;
                        for (var i = 0, list = earths; i < list.length; i += 1) {
                            var p = list[i];

                            p._.interval.call(p, timestamp);
                        }
                    }
                }
            }
            for (var i$1 = 0, list$1 = _.onTweenVals; i$1 < list$1.length; i$1 += 1) {
                var twn = list$1[i$1];

                twn.call(globe, timestamp);
            }
            // if (__.options.tween && !__.drag)
            //     __.options.tween(timestamp);
            earthjs.ticker = requestAnimationFrame(step);
        }
        earthjs.ticker = requestAnimationFrame(step);
        return globe;
    }

    //----------------------------------------
    // Helper
    __.scale = function(y) {
        __.proj.scale(y);
        __.resize();
        __.refresh();
        return globe;
    }

    __.rotate = function(r) {
        __.proj.rotate(r);
        __.refresh();
        return globe;
    }

    __.interval = function(t) {
        for (var i = 0, list = _.onIntervalVals; i < list.length; i += 1) {
            var fn1 = list[i];

            fn1.call(globe, t);
        }
        return globe;
    }

    __.refresh = function(filter) {
        if (filter) {
            var keys = filter ? _.onRefreshKeys.filter(function (d) { return filter.test(d); }) : _.onRefreshKeys;
            keys.forEach(function(fn) {
                _.onRefresh[fn].call(globe);
            });
        } else {
            for (var i = 0, list = _.onRefreshVals; i < list.length; i += 1) {
                var fn2 = list[i];

                fn2.call(globe);
            }
        }
        return globe;
    }

    __.resize = function() {
        for (var i = 0, list = _.onResizeVals; i < list.length; i += 1) {
            var fn3 = list[i];

            fn3.call(globe);
        }
        return globe;
    }

    __.projection = function() {
        var ref = __.options;
        var scale = ref.scale;
        var width = ref.width;
        var height = ref.height;
        var padding = ref.padding;
        if (__.options.map) {
            if (!scale) {
                scale = (width/6.279) - padding;
            }
            return d3.geoEquirectangular()
                .translate(__.center)
                .precision(0.1)
                .scale(scale);
        } else {
            if (!scale) {
                var mins = d3.min([width, height]);
                scale =  mins / 2 - padding;
            }
            var r = __.options.rotate;
            if (typeof(r)==='number') {
                __.options.rotate = [r,-33,-11];
            }
            return d3.geoOrthographic()
                .rotate(__.options.rotate)
                .translate(__.center)
                .precision(0.1)
                .clipAngle(90)
                .scale(scale);
        }

    }

    __.proj = __.projection();
    __.path = d3.geoPath().projection(__.proj);

    globe.__addEventQueue = function(name, qname) {
        var obj = globe[name].__on__;
        if (qname) {
            AddQueueEvent(obj, qname, name);
        } else {
            obj && Object.keys(obj).forEach(function (qname) { return AddQueueEvent(obj, qname, name); });
        }
    }
    globe.__removeEventQueue = function(name, qname) {
        var obj = globe[name].__on__;
        if (obj) {
            if (qname) {
                delete _[qname][name];
                _[qname+'Keys'] = Object.keys(_[qname]);
                _[qname+'Vals'] = _[qname+'Keys'].map(function (k) { return _[qname][k]; });
            } else {
                Object.keys(obj).forEach(function (qname) {
                    delete _[qname][name];
                    _[qname+'Keys'] = Object.keys(_[qname]);
                    _[qname+'Vals'] = _[qname+'Keys'].map(function (k) { return _[qname][k]; });
                });
            }
        }
    }
    return globe;
    //----------------------------------------
    function AddQueueEvent(obj, qname, name) {
        _[qname][name]  = obj[qname];
        _[qname+'Keys'] = Object.keys(_[qname]);
        _[qname+'Vals'] = _[qname+'Keys'].map(function (k) { return _[qname][k]; });
    }
    function qEvent(obj, qname, name) {
        if (obj[qname]) {
            globe[name].__on__[qname] = obj[qname];
            AddQueueEvent(obj, qname, name)
        }
    }
}
if (window.d3===undefined) {
    window.d3 = {};
}
window.d3.earthjs = earthjs;
export default earthjs;
