export default function (options={}) {
    options = Object.assign({
        select: '#earth',
        rotate: 130,
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

        renderOrder: [
            'renderThree',
            'svgAddDropShadow',
            'svgAddCanvas',
            'canvasAddGraticule',
            'canvasAddWorldOrCountries',
            'svgAddOcean',
            'svgAddGlobeShading',
            'svgAddGraticule',
            'svgAddWorldOrCountries',
            'svgAddGlobeHilight',
            'svgAddPlaces',
            'svgAddBar',
        ],
        ready: null,
        loadingData: null
    }
    var drag = false;
    var width = options.width;
    var height = options.height;
    var ltScale = d3.scaleLinear().domain([0, width]).range([-180, 180]);
    var svg = d3.selectAll(options.select).attr("width", width).attr("height", height);
    var planet = {
        _: {
            svg,
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

    planet._.orthoGraphic = function() {
        var width = planet._.options.width;
        var height= planet._.options.height;
        var rotate = planet._.options.rotate;
        var ltRotate = planet._.ltScale(rotate);
        return d3.geoOrthographic()
            .scale(width / 3.5)
            // .scale((height - 40) / 2)
            .rotate([ltRotate, 0])
            .translate([width / 2, height / 2])
            .precision(0.1)
            .clipAngle(90);
    }

    planet._.proj = planet._.orthoGraphic();
    planet._.path = d3.geoPath().projection(planet._.proj);
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
