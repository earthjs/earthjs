import versorFn from './versor.js';

const versor = versorFn();
const earthjs = (options={}) => {
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
    const _ = {
        onCreate: {},
        onCreateCall: 0,
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
        plugins: [],
        promeses: [],
        loadingData: null,
        recreateSvgOrCanvas: function(allPlugins) {
            if (allPlugins) {
                globe.__plugins().forEach(g => {
                    g.__on__.onCreate.call(globe);
                });
            } else {
                _.onCreateVals.forEach(function(fn) {
                    fn.call(globe);
                });    
            }
            if (_.onCreateCall===0 ) {
                const plugins = Object
                    .keys(_.onCreate)
                    .map(s=>globe[s])
                    .filter(g=> g.__name__.match(/^((?!threejs).)*$/i));
                _.onCreate = {};
                plugins.forEach(g => _.onCreate[g.name] = g.__on__.onCreate);
                _.onCreateVals = Object.keys(_.onCreate).map(k => _.onCreate[k]);
            }
            _.onCreateCall++;
            return globe;
        }
    }
    window._ = _;
    const drag = false;
    const svg = d3.selectAll(options.selector);
    let width = +svg.attr('width'), height = +svg.attr('height');
    if (!width || !height) {
        width = options.width || 700;
        height = options.height || 500;
        svg.attr('width', width).attr('height', height);
    }
    d3.selectAll(options.svgCanvasSelector)
        .attr('width', width).attr('height',height);
    const center = [width/2, height/2];
    Object.defineProperty(options, 'width', {
        get: () => width,
        set: (x) => {
            width = x;
            center[0] = x/2;
        }
    });
    Object.defineProperty(options, 'height', {
        get: () => height,
        set: (x) => {
            height = x;
            center[1] = x/2;
        }
    });
    const globe = {
        _: {
            svg,
            drag,
            versor,
            center,
            options,
        },
        $slc: {},
        ready(fn) {
            if (fn) {
                globe._.readyFn = fn;
                globe._.promeses = _.promeses;
                if (_.promeses.length>0) {
                    const q = d3.queue();
                    _.loadingData = true;
                    _.promeses.forEach(obj => {
                        obj.urls.forEach(url => {
                            let ext = url.split('.').pop();
                            if (ext==='geojson') {
                                ext = 'json';
                            }
                            q.defer(d3[ext], url);
                        });
                    })
                    q.await(function() {
                        let args = [].slice.call(arguments);
                        const err = args.shift();
                        _.promeses.forEach(obj => {
                            const ln = obj.urls.length;
                            const ar = args.slice(0,ln);
                            const ready = globe[obj.name].ready;
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
        register(obj, name) {
            const ar = {
                name: name || obj.name, 
                __name__: obj.name, 
                __on__: {}
            };
            _.plugins.push(ar);
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
        get: () => _.loadingData,
    });

    //----------------------------------------
    let earths = [];
    let ticker = null;
    const __ = globe._;

    globe.create = function(twinEarth, allPlugins=false) {
        earths = twinEarth || [];
        _.recreateSvgOrCanvas(allPlugins);
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
        const interval = __.interval;
        intervalTicker = intervalTicker || 10;

        let l1, start1 = 0, p;
        let l2, start2 = 0, fn;
        function step(timestamp) {
            if ((timestamp - start1) > intervalTicker) {
                start1 = timestamp;
                if (!_.loadingData) {
                    interval.call(globe, timestamp);
                    if ((timestamp - start2) > intervalTicker+30) {
                        start2 = timestamp;

                        l2 = l1 = earths.length;
                        while(l1)  {
                            p = earthjs[l2-l1];
                            p._.interval.call(p, timestamp);
                            l1--;
                        }
                    }
                }
            }

            l2 = l1 = _.onTweenVals.length;  
            while(l1) {
                fn = _.onTweenVals[l2-l1];
                fn && fn.call(globe, timestamp); // length can changed!
                l1--;
            }
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
        let l = _.onIntervalVals.length;
        while(l--) {
            _.onIntervalVals[l].call(globe, t);
        }
        return globe;
    }

    __.refresh = function(filter) {
        let l2, l1;
        if (filter) {
            const keys = filter ? _.onRefreshKeys.filter(d => filter.test(d)) : _.onRefreshKeys;
            keys.forEach(function(fn) {
                _.onRefresh[fn].call(globe);
            });
        } else {
            l2 = l1 = _.onRefreshVals.length;
            while(l1) {
                _.onRefreshVals[l2-l1].call(globe);
                l1--
            }
        }
        return globe;
    }

    __.resize = function() {
        let l2, l1;
        l2 = l1 = _.onResizeVals.length;
        while(l1) {
            _.onResizeVals[l2-l1].call(globe);
            l1--;
        }
        return globe;
    }

    __.projection = function() {
        let {scale, width, height, padding} = __.options;
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
                const mins = d3.min([width, height]);
                scale =  mins / 2 - padding;
            }
            const r = __.options.rotate;
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
        const obj = globe[name].__on__;
        if (qname) {
            AddQueueEvent(obj, qname, name);
        } else {
            obj && Object.keys(obj).forEach(qname => AddQueueEvent(obj, qname, name));
        }
    }
    globe.__removeEventQueue = function(name, qname) {
        const obj = globe[name].__on__;
        if (obj) {
            if (qname) {
                delete _[qname][name];
                _[qname+'Keys'] = Object.keys(_[qname]);
                _[qname+'Vals'] = _[qname+'Keys'].map(k => _[qname][k]);
            } else {
                Object.keys(obj).forEach(qname => {
                    delete _[qname][name];
                    _[qname+'Keys'] = Object.keys(_[qname]);
                    _[qname+'Vals'] = _[qname+'Keys'].map(k => _[qname][k]);
                });
            }
        }
    }
    globe.__plugins = function(filter) {
        if (filter===undefined) {
            return _.plugins;
        } else {
            return _.plugins.filter(obj => obj.__name__.match(filter));
        }
    }
    return globe;
    //----------------------------------------
    function AddQueueEvent(obj, qname, name) {
        _[qname][name]  = obj[qname];
        _[qname+'Keys'] = Object.keys(_[qname]);
        _[qname+'Vals'] = _[qname+'Keys'].map(k => _[qname][k]);
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
