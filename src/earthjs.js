export default function (options={}) {
    options = Object.assign({
        select: '#earth',
        height: 500,
        width:  700,
    }, options);
    var _ = {
        onResize: {},
        onResizeKeys: [],

        onRefresh: {},
        onRefreshKeys: [],

        onInterval: {},
        onIntervalKeys: [],

        svgCreateOrder: [
            'svgAddDropShadow',
            'svgAddOcean',
            'svgAddGlobeShading',
            'svgAddGraticule',
            'svgAddWorldOrCountries',
            'svgAddGlobeHilight',
            'svgAddPlaces',
            'svgAddBar'
        ],
        ready: null,
        loadingData: null
    }
    var drag = false;
    var ltScale = d3.scaleLinear().domain([0, options.width]).range([-180, 180]);
    var svg  = d3.selectAll(options.select).attr("width", options.width).attr("height", options.height);
    var proj = d3.geoOrthographic()
        .scale(options.width / 3.5)
        .rotate([ltScale(130), 0])
        .translate([options.width / 2, options.height / 2])
        .clipAngle(90);
    var path = d3.geoPath().projection(proj);
    var planet = {
        _: {
            svg,
            proj,
            path,
            drag,
            options,
            ltScale,
        },
        ready: function(fn) {
            if (fn) {
                _.ready = fn;
            } else {
                return _.loadingData;
            }
        },
        register: function(obj) {
            var ar = {};
            planet[obj.name] = ar;
            Object.keys(obj).map(function(fn) {
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
                var q = d3.queue();
                obj.urls.forEach(function(url) {
                    var ext = url.split('.').pop();
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
    var earth = null;
    var ticker = null;
    planet._.ticker = function(interval) {
        interval = interval || 50;
        ticker = setInterval(function(){
            planet._.intervalRun.call(planet);
            earth && earth._.intervalRun.call(earth);
        }, interval);
        return planet;
    }

    planet.svgDraw = function(twinEarth) {
        _.svgCreateOrder.forEach(function(svgCreateKey) {
            planet[svgCreateKey] && planet[svgCreateKey].call(planet);
        });
        if (twinEarth) {
            twinEarth.svgDraw(null);
            earth = twinEarth;
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
        if (_.onIntervalKeys.length>0) {
            _.onIntervalKeys.map(function(fn) {
                _.onInterval[fn].call(planet);
            });
        }
    }

    planet._.refresh = function() {
        if (_.onRefreshKeys.length>0) {
            _.onRefreshKeys.map(function(fn) {
                _.onRefresh[fn].call(planet);
            });
        }
        return planet;
    }

    planet._.resize = function() {
        if (_.onResizeKeys.length>0) {
            _.onResizeKeys.map(function(fn) {
                _.onResize[fn].call(planet);
            });
        }
        return planet;
    }

    return planet;
    //----------------------------------------
    function qEvent(obj, qname) {
        var qkey = qname+'Keys';
        if (obj[qname]) {
            _[qname][obj.name] = obj[qname];
            _[qkey] = Object.keys(_[qname]);
        }
    }
}
