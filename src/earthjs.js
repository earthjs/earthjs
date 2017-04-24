export default function (options={}) {
    options = Object.assign({
        select: '#earth',
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

        svgCreateOrder: [
            'svgAddDropShadow',
            'svgAddOcean',
            'svgAddGlobeShading',
            'svgAddWorldOrCountries',
            'svgAddGlobeHilight',
            'svgAddGraticule',
            'svgAddPlaces',
        ]
    }
    var drag = false;
    var svg  = d3.select(options.select).attr("width", options.width).attr("height", options.height);
    var proj = d3.geoOrthographic().scale(options.width / 4.1).translate([options.width / 2, options.height / 2]);
    var path = d3.geoPath().projection(proj);
    var planet = {
        _: {
            svg,
            proj,
            path,
            drag,
        },
        register: function(obj) {
            var fn = {};
            planet[obj.name] = fn;
            Object.keys(obj).map(function(name) {
                if ([
                    'data',
                    'ready',
                    'onInit',
                    'onResize',
                    'onRefresh',
                    'onInterval'].indexOf(name)===-1) {
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

    planet._.defs = planet._.svg.append("defs");
    //----------------------------------------
    var ticker = null;
    planet._.ticker = function(interval) {
        interval = interval || 50;
        ticker = setInterval(function(){
            if (_.onIntervalKeys.length>0) {
                _.onIntervalKeys.map(function(key) {
                    _.onInterval[key](planet, options);
                });
            }
        }, interval);
        return planet;
    }

    planet.svgDraw = function() {
        _.svgCreateOrder.forEach(function(svgCreateKey) {
            planet[svgCreateKey] && planet[svgCreateKey](planet, options);
        });
        if (ticker===null) {
            planet._.ticker();
        }
        return planet;
    }

    planet._.refresh = refresh;
    planet._.resize = resize;

    //----------------------------------------
    // Helper

    planet._.scale = function(y) {
        planet._.proj.scale(y);
        planet._.resize(planet, options);
        planet._.refresh(planet, options);
        return planet;
    }

    planet._.rotate = function(r) {
        planet._.proj.rotate(r);
        planet._.refresh(planet, options);
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
