import versorFn from './versor.js';

const versor = versorFn();
export default (options={}) => {
    options = Object.assign({
        select: '#earth',
        rotate: 130,
        height: 500,
        width:  700,
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
        loadingData: null
    }
    const drag = false;
    const width = options.width;
    const height = options.height;
    const center = [width/2, height/2];
    const ltScale = d3.scaleLinear().domain([0, width]).range([-180, 180]);
    const svg = d3.selectAll(options.select).attr("width", width).attr("height", height);
    const planet = {
        _: {
            svg,
            drag,
            versor,
            center,
            options,
            ltScale,
        },
        ready(fn) {
            if (fn) {
                _.ready = fn;
            } else {
                return _.loadingData;
            }
        },
        register(obj) {
            const ar = {};
            planet[obj.name] = ar;
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
                            return obj[fn].apply(planet, arguments);
                        }
                    }
                }
            });
            if (obj.onInit) {
                obj.onInit.call(planet);
            }
            qEvent(obj,'onResize');
            qEvent(obj,'onRefresh');
            qEvent(obj,'onInterval');
            if (obj.urls && obj.onReady) {
                _.loadingData = true;
                const q = d3.queue();
                obj.urls.forEach(url => {
                    let ext = url.split('.').pop();
                    if (ext==='geojson') {
                        ext = 'json';
                    }
                    q.defer(d3[ext], url);
                });
                q.await(function() {
                    obj.onReady.apply(planet, arguments);
                    _.loadingData = false;
                    _.ready.call(planet);
                });
            }
            return planet;
        }
    }

    planet._.defs = planet._.svg.append("defs");
    //----------------------------------------
    let earth = null;
    let ticker = null;
    planet._.ticker = function(interval) {
        const ex = planet._.intervalRun;
        interval = interval || 50;
        ticker = setInterval(() => {
            ex.call(planet);
            if (earth) {
                earth.forEach(function(p) {
                    p._.intervalRun.call(p);
                });
            }
        }, interval);
        return planet;
    }

    planet.svgDraw = function(twinEarth) {
        earth = twinEarth;
        _.renderOrder.forEach(function(renderer) {
            planet[renderer] && planet[renderer].call(planet);
        });
        if (earth) {
            earth.forEach(function(p) {
                p.svgDraw(null);
            });
        }
        if (ticker===null && twinEarth!==null) {
            planet._.ticker.call(planet);
        }
        return planet;
    }

    //----------------------------------------
    // Helper
    planet._.scale = function(y) {
        planet._.proj.scale(y);
        planet._.resize.call(planet);
        planet._.refresh.call(planet);
        return planet;
    }

    planet._.rotate = function(r) {
        planet._.proj.rotate(r);
        planet._.refresh.call(planet);
        return planet;
    }

    planet._.intervalRun = function() {
        _.onIntervalKeys.forEach(function(fn) {
            _.onInterval[fn].call(planet);
        });
        return planet;
    }

    planet._.refresh = function() {
        _.onRefreshKeys.forEach(function(fn) {
            _.onRefresh[fn].call(planet);
        });
        return planet;
    }

    planet._.resize = function() {
        _.onResizeKeys.forEach(function(fn) {
            _.onResize[fn].call(planet);
        });
        return planet;
    }

    planet._.orthoGraphic = function() {
        const width = planet._.options.width;
        const height= planet._.options.height;
        const rotate = planet._.options.rotate;
        const ltRotate = planet._.ltScale(rotate);
        return d3.geoOrthographic()
            .scale(width / 3.5)
            .rotate([ltRotate, 0])
            .translate([width / 2, height / 2])
            .precision(0.1)
            .clipAngle(90);
    }

    planet._.addRenderer = function(name) {
        if (_.renderOrder.indexOf(name)<0) {
            _.renderOrder.push(name);
        }
    }

    planet._.proj = planet._.orthoGraphic();
    planet._.path = d3.geoPath().projection(planet._.proj);
    return planet;
    //----------------------------------------
    function qEvent(obj, qname) {
        const qkey = qname+'Keys';
        if (obj[qname]) {
            _[qname][obj.name] = obj[qname];
            _[qkey] = Object.keys(_[qname]);
        }
    }
}
