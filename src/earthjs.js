import versorFn from './versor.js';

const versor = versorFn();
const earthjs = (options={}) => {
    /*eslint no-console: 0 */
    clearInterval(earthjs.ticker);
    options = Object.assign({
        selectAll: '#earth-js',
        rotate: [130,-33,-11],
        transparent: false,
    }, options);
    const _ = {
        onCreate: {},
        onCreateVals: [],

        onRefresh: {},
        onRefreshVals: [],

        onResize: {},
        onResizeVals: [],

        onInterval: {},
        onIntervalVals: [],

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
    window.__ = _;
    const drag = false;
    const svg = d3.selectAll(options.selectAll);
    let width = svg.attr('width'), height = svg.attr('height');
    if (!width || !height) {
        width = options.width || 700;
        height = options.height || 500;
        svg.attr('width', width).attr('height', height);
    }
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
            if (fn && _.promeses.length>0) {
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
                    fn.call(globe);
                });
            } else if (arguments.length===0) {
                return _.loadingData;
            }
        },
        register(obj) {
            const ar = {};
            globe[obj.name] = ar;
            Object.keys(obj).forEach(function(fn) {
                if ([
                    'urls',
                    'onReady',
                    'onInit',
                    'onCreate',
                    'onRefresh',
                    'onResize',
                    'onInterval'].indexOf(fn)===-1) {
                    if (typeof(obj[fn])==='function') {
                        ar[fn] = function() {
                            return obj[fn].apply(globe, arguments);
                        }
                    }
                }
            });
            if (obj.onInit) {
                obj.onInit.call(globe);
            }
            qEvent(obj,'onCreate');
            qEvent(obj,'onResize');
            qEvent(obj,'onRefresh');
            qEvent(obj,'onInterval');
            if (obj.urls && obj.onReady) {
                _.promeses.push({
                    name: obj.name,
                    urls: obj.urls,
                    onReady: obj.onReady
                });
            }
            return globe;
        }
    }

    //----------------------------------------
    let earths = [];
    let ticker = null;
    const __ = globe._;

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
        const interval = __.interval;
        intervalTicker = intervalTicker || 50;
        ticker = setInterval(() => { // 33% less CPU compare with d3.timer
            interval.call(globe);
            earths.forEach(function(p) {
                p._.interval.call(p);
            });
        }, intervalTicker);
        earthjs.ticker = ticker;
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

    __.interval = function() {
        _.onIntervalVals.forEach(function(fn) {
            fn.call(globe);
        });
        return globe;
    }

    __.refresh = function(filter) {
        if (filter) {
            const keys = filter ? _.onRefreshKeys.filter(d => filter.test(d)) : _.onRefreshKeys;
            keys.forEach(function(fn) {
                _.onRefresh[fn].call(globe);
            });
        } else {
            _.onRefreshVals.forEach(function(fn) {
                fn.call(globe);
            });
        }
        return globe;
    }

    __.resize = function() {
        _.onResizeVals.forEach(function(fn) {
            fn.call(globe);
        });
        return globe;
    }

    __.orthoGraphic = function() {
        const r = __.options.rotate;
        if (typeof(r)==='number') {
            __.options.rotate = [r,-33,-11];
        }
        return d3.geoOrthographic()
            .rotate(__.options.rotate)
            .scale(__.options.width/3.5)
            .translate(__.center)
            .precision(0.1)
            .clipAngle(90);
    }

    __.proj = __.orthoGraphic();
    __.path = d3.geoPath().projection(__.proj);
    return globe;
    //----------------------------------------
    function qEvent(obj, qname) {
        if (obj[qname]) {
            _[qname][obj.name] = obj[qname];
            _[qname+'Keys'] = Object.keys(_[qname]);
            _[qname+'Vals'] = _[qname+'Keys'].map(k => _[qname][k]);
        }
    }
}
export default earthjs;
