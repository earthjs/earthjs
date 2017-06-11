import versorFn from './versor.js';

const versor = versorFn();
const earthjs = (options={}) => {
    /*eslint no-console: 0 */
    clearInterval(earthjs.ticker);
    options = Object.assign({
        select: '#earth',
        rotate: 130,
    }, options);
    const _ = {
        onResize: {},
        onResizeKeys: [],

        onRefresh: {},
        onRefreshKeys: [],

        onInterval: {},
        onIntervalKeys: [],

        renderOrder: [
            'renderThree',
            'svgAddDropShadow',
            'svgAddCanvas',
            'canvasAddGraticule',
            'canvasAddWorldOrCountries',
            'canvasAddDots',
            'svgAddOcean',
            'svgAddGlobeShading',
            'svgAddGraticule',
            'svgAddWorldOrCountries',
            'svgAddGlobeHilight',
            'svgAddPlaces',
            'svgAddPings',
            'svgAddDots',
            'svgAddBar',
        ],
        ready: null,
        loadingData: null,
        promeses: []
    }
    const drag = false;
    const svg = d3.selectAll(options.select);
    let width = svg.attr('width'), height = svg.attr('height');
    const ltScale = d3.scaleLinear().domain([0, width]).range([-180, 180]);
    if (!width || !height) {
        width = options.width || 700;
        height = options.height || 500;
        svg.attr("width", width).attr("height", height);
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
            ltScale,
        },
        $: {},
        ready(fn) {
            if (fn) {
                if (_.promeses.length>0) {
                    _.loadingData = true;
                    const q = d3.queue();
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
                            ar.unshift(err);

                            obj.onReady.apply(globe, ar);
                            args = args.slice(ln);
                        });
                        _.loadingData = false;
                        fn.call(globe);
                    });
                }
            } else {
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
                obj.onInit.call(globe);
            }
            qEvent(obj,'onResize');
            qEvent(obj,'onRefresh');
            qEvent(obj,'onInterval');
            if (obj.urls && obj.onReady) {
                _.promeses.push({
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

    globe.svgDraw = function(twinEarth) {
        const $ = globe.$;
        earths = twinEarth || [];
        _.renderOrder.forEach(function(renderer) {
            $[renderer] && $[renderer].call(globe);
        });
        earths.forEach(function(p) {
            p.svgDraw(null);
        });
        if (ticker===null && earths!==[]) {
            __.ticker();
        }
        return globe;
    }

    __.defs = __.svg.append("defs");
    __.ticker = function(interval) {
        const ex = __.intervalRun;
        interval = interval || 50;
        ticker = setInterval(() => {
            ex.call(globe);
            earths.forEach(function(p) {
                p._.intervalRun.call(p);
            });
        }, interval);
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

    __.intervalRun = function() {
        _.onIntervalKeys.forEach(function(fn) {
            _.onInterval[fn].call(globe);
        });
        return globe;
    }

    __.refresh = function(filter) {
        const keys = filter ? _.onRefreshKeys.filter(d => filter.test(d)) : _.onRefreshKeys;
        keys.forEach(function(fn) {
            _.onRefresh[fn].call(globe);
        });
        return globe;
    }

    __.resize = function() {
        _.onResizeKeys.forEach(function(fn) {
            _.onResize[fn].call(globe);
        });
        return globe;
    }

    __.orthoGraphic = function() {
        return d3.geoOrthographic()
            .rotate([__.options.rotate, 0])
            .scale(__.options.width / 3.5)
            .translate(__.center)
            .precision(0.1)
            .clipAngle(90);
    }

    __.addRenderer = function(name) {
        if (_.renderOrder.indexOf(name)<0) {
            _.renderOrder.push(name);
        }
    }

    __.proj = __.orthoGraphic();
    __.path = d3.geoPath().projection(__.proj);
    return globe;
    //----------------------------------------
    function qEvent(obj, qname) {
        if (obj[qname]) {
            _[qname][obj.name] = obj[qname];
            _[qname+'Keys'] = Object.keys(_[qname]);
        }
    }
}
export default earthjs;
