export default function (options={}) {
    options = Object.assign({
        select: '#earth',
        interval: 50,
        height: 870,
        width: 1700,
    }, options);
    var _ = {
        onResize: {},
        onResizeKeys: [],

        onRefresh: {},
        onRefreshKeys: [],

        onInterval: {},
        onIntervalKeys: [],
    }

    var svg  = d3.select(options.select).attr("width", options.width).attr("height", options.height);
    var proj = d3.geoOrthographic().scale(options.width / 4.1).translate([options.width / 2, options.height / 2]).precision(0.1);
    var path = d3.geoPath().projection(proj);
    var planet = {
        svg,
        proj,
        path,
        _: {},
        state: {drag: false},
        register: function(obj) {
            var fn = {};
            planet[obj.name] = fn;
            Object.keys(obj).map(function(name) {
                if (['onResize', 'onInterval', 'onRefresh', 'ready', 'data'].indexOf(name)===-1) {
                    if (typeof(obj[name])==='function') {
                        fn[name] = function() {
                            var args = [].slice.call(arguments);
                            args.unshift(planet, options);
                            return obj[name].apply(null, args);
                        }
                    }
                }
            });
            if (obj.onInit) {
                obj.onInit(planet, options);
            }
            qEvent(obj,'onResize');
            qEvent(obj,'onRefresh');
            qEvent(obj,'onInterval');
            if (obj.data && obj.ready) {
                var q = d3.queue();
                obj.data.forEach(function(data) {
                    var ext = data.split('.').pop();
                    q.defer(d3[ext], data);
                });
                q.await(function() {
                    var args = [].slice.call(arguments);
                    args.unshift(planet, options);
                    obj.ready.apply(null, args);
                });
            }
            return planet;
        }
    }

    planet._.defs = planet.svg.append("defs");
    //----------------------------------------
    var ticker;
    planet.ticker = function(interval) {
        if (interval) {
            options.interval = interval;
            clearInterval(ticker);
        }
        ticker = setInterval(function(){
            if (_.onIntervalKeys.length>0) {
                _.onIntervalKeys.map(function(key) {
                    _.onInterval[key](planet, options);
                });
            }
        }, options.interval);
        return planet;
    }

    planet.svgCreateOrder = [
        'svgAddDropShadow',
        'svgAddOcean',
        'svgAddGlobeShading',
        'svgAddWorldOrCountries',
        'svgAddGlobeHilight',
        'svgAddGraticule',
        'svgAddPlaces',
    ];

    planet.svgRecreate = svgRecreate;
    planet.refresh = refresh;
    planet.resize = resize;

    //----------------------------------------
    // Helper

    planet.draw = function() {
        planet.svgRecreate(planet);
    }

    planet.scale = function(y) {
        planet.proj.scale(y);
        planet.resize(planet, options);
        planet.refresh(planet, options);
        return planet;
    }

    planet.rotate = function(r) {
        planet.proj.rotate(r);
        planet.refresh(planet, options);
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

    function svgRecreate(planet) {
        planet.svgCreateOrder.forEach(function(svgCreateKey) {
            planet[svgCreateKey] && planet[svgCreateKey](planet, options);
        });
        return planet;
    }

    function refresh(planet, options) {
        if (_.onRefreshKeys.length>0) {
            _.onRefreshKeys.map(function(key) {
                _.onRefresh[key](planet, options);
            });
        }
        return planet;
    }

    function resize(planet, options) {
        if (_.onResizeKeys.length>0) {
            _.onResizeKeys.map(function(key) {
                _.onResize[key](planet, options);
            });
        }
        return planet;
    }
}
