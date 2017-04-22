window.earthjs = function(){
    var earthjs = null;
    if (window) originalEarthjs = window.earthjs;

    earthjs = function (options={}) {
        options = Object.assign({
            select: '#earth',
            drawTick: 50,
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
        };
        var svg  = d3.select(options.select).attr("width", options.width).attr("height", options.height);
        var proj = d3.geoOrthographic().scale(options.width / 4.1).translate([options.width / 2, options.height / 2]).precision(1);
        var path = d3.geoPath().projection(proj);
        var planet = {
            svg,
            proj,
            path,
            state: {drag: false},
            width: options.width,
            height: options.height,
            register: function(obj) {
                var fn = {};
                planet[obj.name] = fn;
                Object.keys(obj).map(function(name) {
                    if (['onResize', 'onInterval', 'onRefresh', 'ready', 'json'].indexOf(name)===-1) {
                        if (typeof(obj[name])==='function') {
                            fn[name] = function() {
                                var args = [].slice.call(arguments);
                                args.unshift(planet, options);
                                obj[name].apply(null, args);
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
                if (obj.json && obj.ready) {
                    queue().defer(d3.json, obj.json).await(function(err, data) {
                        obj.ready(planet, options, err, data);
                    });
                }
                return planet;
            }
        };
        //----------------------------------------
        planet.resize = resize;
        planet.refresh = refresh;
        planet.recreateSvg = recreateSvg;
        planet.svgCreateOrder = [
            'addGlobeDropShadow',
            'addOcean',
            'addGlobeShading',
            'addWorldOrCountries',
            'addGlobeHilight',
            'addGraticule',
            'addPlaces',
        ];
        planet.draw = function() {
            setInterval(function(){
                if (_.onIntervalKeys.length>0) {
                    _.onIntervalKeys.map(function(key, index) {
                        _.onInterval[key](planet, options);
                    });
                }
            }, options.drawTick);
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

        function recreateSvg(planet) {
            planet.svgCreateOrder.forEach(function(svgCreateKey) {
                planet[svgCreateKey] && planet[svgCreateKey](planet, options);
            });
        }

        function refresh(planet, options) {
            if (_.onRefreshKeys.length>0) {
                _.onRefreshKeys.map(function(key, index) {
                    _.onRefresh[key](planet, options);
                });
            }
        }

        function resize(planet, options) {
            if (_.onResizeKeys.length>0) {
                _.onResizeKeys.map(function(key, index) {
                    _.onResize[key](planet, options);
                });
            }
        }
    };

    earthjs.plugins = {};
    earthjs.noConflict = function() {
        window.earthjs = originalEarthjs;
        return earthjs;
    };
    return earthjs;
}();
