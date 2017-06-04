import versorFn from './versor.js';

const versor = versorFn();
const earthjs = (options={}) => {
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
        width = 700;
        height = 500;
        svg.attr("width", width).attr("height", height);
    }
    options.width = width;
    options.height = height;
    const center = [width/2, height/2];
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
            globe._.ticker.call(globe);
        }
        return globe;
    }

    globe._.defs = globe._.svg.append("defs");
    globe._.ticker = function(interval) {
        const ex = globe._.intervalRun;
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
    globe._.scale = function(y) {
        globe._.proj.scale(y);
        globe._.resize.call(globe);
        globe._.refresh.call(globe);
        return globe;
    }

    globe._.rotate = function(r) {
        globe._.proj.rotate(r);
        globe._.refresh.call(globe);
        return globe;
    }

    globe._.intervalRun = function() {
        _.onIntervalKeys.forEach(function(fn) {
            _.onInterval[fn].call(globe);
        });
        return globe;
    }

    globe._.refresh = function(filter) {
        const keys = filter ? _.onRefreshKeys.filter(d => filter.test(d)) : _.onRefreshKeys;
        keys.forEach(function(fn) {
            _.onRefresh[fn].call(globe);
        });
        return globe;
    }

    globe._.resize = function() {
        _.onResizeKeys.forEach(function(fn) {
            _.onResize[fn].call(globe);
        });
        return globe;
    }

    globe._.orthoGraphic = function() {
        const width = globe._.options.width;
        const height = globe._.options.height;
        const rotate = globe._.options.rotate;
        const ltRotate = globe._.ltScale(rotate);
        return d3.geoOrthographic()
            .scale(width / 3.5)
            .rotate([ltRotate, 0])
            .translate([width / 2, height / 2])
            .precision(0.1)
            .clipAngle(90);
    }

    globe._.addRenderer = function(name) {
        if (_.renderOrder.indexOf(name)<0) {
            _.renderOrder.push(name);
        }
    }

    globe._.proj = globe._.orthoGraphic();
    globe._.path = d3.geoPath().projection(globe._.proj);
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
