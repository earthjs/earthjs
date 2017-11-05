var earthjs = (function () {
'use strict';

// Version 0.0.0. Copyright 2017 Mike Bostock.
var versorFn = (function () {
  var acos = Math.acos,
      asin = Math.asin,
      atan2 = Math.atan2,
      cos = Math.cos,
      max = Math.max,
      min = Math.min,
      PI = Math.PI,
      sin = Math.sin,
      sqrt = Math.sqrt,
      radians = PI / 180,
      degrees = 180 / PI;

  // Returns the unit quaternion for the given Euler rotation angles [λ, φ, γ].
  function versor(e) {
    var l = e[0] / 2 * radians,
        sl = sin(l),
        cl = cos(l),
        // λ / 2
    p = e[1] / 2 * radians,
        sp = sin(p),
        cp = cos(p),
        // φ / 2
    g = e[2] / 2 * radians,
        sg = sin(g),
        cg = cos(g); // γ / 2
    return [cl * cp * cg + sl * sp * sg, sl * cp * cg - cl * sp * sg, cl * sp * cg + sl * cp * sg, cl * cp * sg - sl * sp * cg];
  }

  // Returns Cartesian coordinates [x, y, z] given spherical coordinates [λ, φ].
  versor.cartesian = function (e) {
    var l = e[0] * radians,
        p = e[1] * radians,
        cp = cos(p);
    return [cp * cos(l), cp * sin(l), sin(p)];
  };

  // Returns the Euler rotation angles [λ, φ, γ] for the given quaternion.
  versor.rotation = function (q) {
    return [atan2(2 * (q[0] * q[1] + q[2] * q[3]), 1 - 2 * (q[1] * q[1] + q[2] * q[2])) * degrees, asin(max(-1, min(1, 2 * (q[0] * q[2] - q[3] * q[1])))) * degrees, atan2(2 * (q[0] * q[3] + q[1] * q[2]), 1 - 2 * (q[2] * q[2] + q[3] * q[3])) * degrees];
  };

  // Returns the quaternion to rotate between two cartesian points on the sphere.
  versor.delta = function (v0, v1) {
    var w = cross(v0, v1),
        l = sqrt(dot(w, w));
    if (!l) return [1, 0, 0, 0];
    var t = acos(max(-1, min(1, dot(v0, v1)))) / 2,
        s = sin(t); // t = θ / 2
    return [cos(t), w[2] / l * s, -w[1] / l * s, w[0] / l * s];
  };

  // Returns the quaternion that represents q0 * q1.
  versor.multiply = function (q0, q1) {
    return [q0[0] * q1[0] - q0[1] * q1[1] - q0[2] * q1[2] - q0[3] * q1[3], q0[0] * q1[1] + q0[1] * q1[0] + q0[2] * q1[3] - q0[3] * q1[2], q0[0] * q1[2] - q0[1] * q1[3] + q0[2] * q1[0] + q0[3] * q1[1], q0[0] * q1[3] + q0[1] * q1[2] - q0[2] * q1[1] + q0[3] * q1[0]];
  };

  function cross(v0, v1) {
    return [v0[1] * v1[2] - v0[2] * v1[1], v0[2] * v1[0] - v0[0] * v1[2], v0[0] * v1[1] - v0[1] * v1[0]];
  }

  function dot(v0, v1) {
    return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
  }

  return versor;
});

var versor = versorFn();
var earthjs$2 = function earthjs() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    /*eslint no-console: 0 */
    cancelAnimationFrame(earthjs.ticker);
    options = Object.assign({
        svgCanvasSelector: '.ej-svg,.ej-canvas',
        selector: '#earth-js',
        rotate: [130, -33, -11],
        transparent: false,
        map: false,
        padding: 0
    }, options);
    var _ = {
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
        recreateSvgOrCanvas: function recreateSvgOrCanvas(allPlugins) {
            if (allPlugins) {
                globe.__plugins().forEach(function (g) {
                    g.__on__.onCreate.call(globe);
                });
            } else {
                _.onCreateVals.forEach(function (fn) {
                    fn.call(globe);
                });
            }
            if (_.onCreateCall === 0) {
                var plugins = Object.keys(_.onCreate).map(function (s) {
                    return globe[s];
                }).filter(function (g) {
                    return g.__name__.match(/^((?!threejs).)*$/i);
                });
                _.onCreate = {};
                plugins.forEach(function (g) {
                    return _.onCreate[g.name] = g.__on__.onCreate;
                });
                _.onCreateVals = Object.keys(_.onCreate).map(function (k) {
                    return _.onCreate[k];
                });
            }
            _.onCreateCall++;
            return globe;
        }
    };
    window._ = _;
    var drag = false;
    var svg = d3.selectAll(options.selector);
    var width = +svg.attr('width'),
        height = +svg.attr('height');
    if (!width || !height) {
        width = options.width || 700;
        height = options.height || 500;
        svg.attr('width', width).attr('height', height);
    }
    d3.selectAll(options.svgCanvasSelector).attr('width', width).attr('height', height);
    var center = [width / 2, height / 2];
    Object.defineProperty(options, 'width', {
        get: function get() {
            return width;
        },
        set: function set(x) {
            width = x;
            center[0] = x / 2;
        }
    });
    Object.defineProperty(options, 'height', {
        get: function get() {
            return height;
        },
        set: function set(x) {
            height = x;
            center[1] = x / 2;
        }
    });
    var globe = {
        _: {
            svg: svg,
            drag: drag,
            versor: versor,
            center: center,
            options: options
        },
        $slc: {},
        ready: function ready(fn) {
            if (fn) {
                globe._.readyFn = fn;
                globe._.promeses = _.promeses;
                if (_.promeses.length > 0) {
                    var q = d3.queue();
                    _.loadingData = true;
                    _.promeses.forEach(function (obj) {
                        obj.urls.forEach(function (url) {
                            var ext = url.split('.').pop();
                            if (ext === 'geojson') {
                                ext = 'json';
                            }
                            q.defer(d3[ext], url);
                        });
                    });
                    q.await(function () {
                        var args = [].slice.call(arguments);
                        var err = args.shift();
                        _.promeses.forEach(function (obj) {
                            var ln = obj.urls.length;
                            var ar = args.slice(0, ln);
                            var ready = globe[obj.name].ready;
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
            } else if (arguments.length === 0) {
                return _.loadingData;
            }
        },
        register: function register(obj, name) {
            var ar = {
                name: name || obj.name,
                __name__: obj.name,
                __on__: {}
            };
            _.plugins.push(ar);
            globe[ar.name] = ar;
            Object.keys(obj).forEach(function (fn) {
                if (['urls', 'onReady', 'onInit', 'onTween', 'onCreate', 'onResize', 'onRefresh', 'onInterval'].indexOf(fn) === -1) {
                    if (typeof obj[fn] === 'function') {
                        ar[fn] = function () {
                            return obj[fn].apply(globe, arguments);
                        };
                    }
                }
            });
            if (obj.onInit) {
                obj.onInit.call(globe, ar);
            }
            qEvent(obj, 'onTween', ar.name);
            qEvent(obj, 'onCreate', ar.name);
            qEvent(obj, 'onResize', ar.name);
            qEvent(obj, 'onRefresh', ar.name);
            qEvent(obj, 'onInterval', ar.name);
            if (obj.urls && obj.onReady) {
                _.promeses.push({
                    name: ar.name,
                    urls: obj.urls,
                    onReady: obj.onReady
                });
            }
            return globe;
        }
    };
    Object.defineProperty(globe, 'loading', {
        get: function get() {
            return _.loadingData;
        }
    });

    //----------------------------------------
    var earths = [];
    var ticker = null;
    var __ = globe._;

    globe.create = function (twinEarth) {
        var allPlugins = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        earths = twinEarth || [];
        _.recreateSvgOrCanvas(allPlugins);
        earths.forEach(function (p) {
            p.create(null);
        });
        if (ticker === null && earths !== []) {
            __.ticker();
        }
        return globe;
    };

    globe.$slc.defs = __.svg.append('defs');
    __.ticker = function (intervalTicker) {
        var interval = __.interval;
        intervalTicker = intervalTicker || 10;

        var l1 = void 0,
            start1 = 0,
            p = void 0;
        var l2 = void 0,
            start2 = 0,
            fn = void 0;
        function step(timestamp) {
            if (timestamp - start1 > intervalTicker) {
                start1 = timestamp;
                if (!_.loadingData) {
                    interval.call(globe, timestamp);
                    if (timestamp - start2 > intervalTicker + 30) {
                        start2 = timestamp;

                        l2 = l1 = earths.length;
                        while (l1) {
                            p = earthjs[l2 - l1];
                            p._.interval.call(p, timestamp);
                            l1--;
                        }
                    }
                }
            }

            l2 = l1 = _.onTweenVals.length;
            while (l1) {
                fn = _.onTweenVals[l2 - l1];
                fn && fn.call(globe, timestamp); // length can changed!
                l1--;
            }
            earthjs.ticker = requestAnimationFrame(step);
        }
        earthjs.ticker = requestAnimationFrame(step);
        return globe;
    };

    //----------------------------------------
    // Helper
    __.scale = function (y) {
        __.proj.scale(y);
        __.resize();
        __.refresh();
        return globe;
    };

    __.rotate = function (r) {
        __.proj.rotate(r);
        __.refresh();
        return globe;
    };

    __.interval = function (t) {
        var l = _.onIntervalVals.length;
        while (l--) {
            _.onIntervalVals[l].call(globe, t);
        }
        return globe;
    };

    __.refresh = function (filter) {
        var l2 = void 0,
            l1 = void 0;
        if (filter) {
            var keys = filter ? _.onRefreshKeys.filter(function (d) {
                return filter.test(d);
            }) : _.onRefreshKeys;
            keys.forEach(function (fn) {
                _.onRefresh[fn].call(globe);
            });
        } else {
            l2 = l1 = _.onRefreshVals.length;
            while (l1) {
                _.onRefreshVals[l2 - l1].call(globe);
                l1--;
            }
        }
        return globe;
    };

    __.resize = function () {
        var l2 = void 0,
            l1 = void 0;
        l2 = l1 = _.onResizeVals.length;
        while (l1) {
            _.onResizeVals[l2 - l1].call(globe);
            l1--;
        }
        return globe;
    };

    __.projection = function () {
        var _$options = __.options,
            scale = _$options.scale,
            width = _$options.width,
            height = _$options.height,
            padding = _$options.padding;

        if (__.options.map) {
            if (!scale) {
                scale = width / 6.279 - padding;
            }
            return d3.geoEquirectangular().translate(__.center).precision(0.1).scale(scale);
        } else {
            if (!scale) {
                var mins = d3.min([width, height]);
                scale = mins / 2 - padding;
            }
            var r = __.options.rotate;
            if (typeof r === 'number') {
                __.options.rotate = [r, -33, -11];
            }
            return d3.geoOrthographic().rotate(__.options.rotate).translate(__.center).precision(0.1).clipAngle(90).scale(scale);
        }
    };

    __.proj = __.projection();
    __.path = d3.geoPath().projection(__.proj);

    globe.__addEventQueue = function (name, qname) {
        var obj = globe[name].__on__;
        if (qname) {
            AddQueueEvent(obj, qname, name);
        } else {
            obj && Object.keys(obj).forEach(function (qname) {
                return AddQueueEvent(obj, qname, name);
            });
        }
    };
    globe.__removeEventQueue = function (name, qname) {
        var obj = globe[name].__on__;
        if (obj) {
            if (qname) {
                delete _[qname][name];
                _[qname + 'Keys'] = Object.keys(_[qname]);
                _[qname + 'Vals'] = _[qname + 'Keys'].map(function (k) {
                    return _[qname][k];
                });
            } else {
                Object.keys(obj).forEach(function (qname) {
                    delete _[qname][name];
                    _[qname + 'Keys'] = Object.keys(_[qname]);
                    _[qname + 'Vals'] = _[qname + 'Keys'].map(function (k) {
                        return _[qname][k];
                    });
                });
            }
        }
    };
    globe.__plugins = function (filter) {
        if (filter === undefined) {
            return _.plugins;
        } else {
            return _.plugins.filter(function (obj) {
                return obj.__name__.match(filter);
            });
        }
    };
    return globe;
    //----------------------------------------
    function AddQueueEvent(obj, qname, name) {
        _[qname][name] = obj[qname];
        _[qname + 'Keys'] = Object.keys(_[qname]);
        _[qname + 'Vals'] = _[qname + 'Keys'].map(function (k) {
            return _[qname][k];
        });
    }
    function qEvent(obj, qname, name) {
        if (obj[qname]) {
            globe[name].__on__[qname] = obj[qname];
            AddQueueEvent(obj, qname, name);
        }
    }
};
if (window.d3 === undefined) {
    window.d3 = {};
}
window.d3.earthjs = earthjs$2;

var baseCsv = function () {
    /*eslint no-console: 0 */
    var _ = { data: [] };
    var args = arguments;

    return {
        name: 'baseCsv',
        urls: Array.prototype.slice.call(args),
        onReady: function onReady(err, csv) {
            _.me.data(csv);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(_data) {
            if (_data) {
                _.data = _data;
            } else {
                return _.data;
            }
        },
        message: function message(fn) {
            _.data = _.data.map(fn);
        },
        allData: function allData(all) {
            if (all) {
                _.data = all.data;
            } else {
                var data = _.data;

                return { data: data };
            }
        },
        arrToJson: function arrToJson(k, v) {
            var json = {};
            _.data.forEach(function (x) {
                return json[x[k]] = x[v];
            });
            return json;
        }
    };
};

var baseGeoJson = (function (jsonUrl) {
    /*eslint no-console: 0 */
    var _ = { data: null };

    return {
        name: 'baseGeoJson',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, json) {
            _.me.data(json);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(_data) {
            if (_data) {
                _.data = _data;
            } else {
                return _.data;
            }
        },
        message: function message(fn) {
            _.data = _.data.map(fn);
        },
        allData: function allData(all) {
            if (all) {
                _.data = all.data;
            } else {
                var data = _.data;

                return { data: data };
            }
        }
    };
});

var worldJson = (function (jsonUrl) {
    /*eslint no-console: 0 */
    var _ = {
        world: null,
        land: null,
        lakes: { type: 'FeatureCollection', features: [] },
        selected: { type: 'FeatureCollection', features: [] },
        countries: { type: 'FeatureCollection', features: [] }
    };

    return {
        name: 'worldJson',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, json) {
            _.me.data(json);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.land = topojson.feature(_data, _data.objects.land);
                _.countries.features = topojson.feature(_data, _data.objects.countries).features;
                if (_data.objects.ne_110m_lakes) _.lakes.features = topojson.feature(_data, _data.objects.ne_110m_lakes).features;
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.land = all.land;
                _.lakes = all.lakes;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    land = _.land,
                    lakes = _.lakes,
                    countries = _.countries;

                return { world: world, land: land, lakes: lakes, countries: countries };
            }
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        }
    };
});

var world3dJson = function () {
    // function is required for arguments works
    /*eslint no-console: 0 */
    var _ = {
        data: {},
        nm_to_id: {},
        geometries: []
    };
    var args = arguments;

    return {
        name: 'world3dJson',
        urls: Array.prototype.slice.call(args),
        onReady: function onReady(err, json, nm_to_id) {
            _.me.data(json);
            if (nm_to_id) {
                _.me.arrayOfGeometry(nm_to_id);
            }
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(_data) {
            if (_data) {
                _.data = _data;
            } else {
                return _.data;
            }
        },
        message: function message(fn) {
            _.data = _.data.map(fn);
        },
        allData: function allData(all) {
            if (all) {
                _.data = all.data;
            } else {
                var data = _.data,
                    geometries = _.geometries,
                    nm_to_id = _.nm_to_id;

                return { data: data, geometries: geometries, nm_to_id: nm_to_id };
            }
        },
        arrayOfGeometry: function arrayOfGeometry(data) {
            var features = [];
            for (var name in _.data) {
                var geometry = _.data[name];
                var cid = data[name.toUpperCase()];
                var properties = { cid: cid };
                geometry.properties = properties;
                features.push({ properties: properties, geometry: geometry });
            }
            _.nm_to_id = data;
            _.geometries = { features: features };
        }
    };
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var choroplethCsv = (function (csvUrl) {
    var scheme = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'schemeReds';

    /*eslint no-console: 0 */
    var _ = {
        cid: null,
        data: null,
        color: null,
        oldData: null,
        selectedColorId: null,
        selectedCountryId: null,
        countries: { type: 'FeatureCollection', features: [] }
    };

    function getPath(path) {
        var v = this;
        path.split('.').forEach(function (p) {
            return v = v[p];
        });
        return v;
    }

    function updatePath(path, value) {
        var o = void 0,
            k = void 0,
            v = this;
        path.split('.').forEach(function (p) {
            o = v;
            k = p;
            v = v[p];
        });
        o[k] = value;
    }

    return {
        name: 'choroplethCsv',
        urls: csvUrl && [csvUrl],
        onReady: function onReady(err, csv) {
            _.me.data(csv);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(_data) {
            if (_data) {
                _.data = _data;
                _.oldData = _data;
                _.data.getPath = getPath;
                _.data.updatePath = updatePath;
            } else {
                return _.data;
            }
        },
        filter: function filter(fn) {
            _.data = _.oldData.filter(fn);
        },
        mergeData: function mergeData(json, arr) {
            var cn = _.data;
            var id = arr[0].split(':');
            var vl = arr[1].split(':');
            json.features.forEach(function (obj) {
                var o = cn.find(function (src) {
                    return getPath.call(obj, id[0]) === getPath.call(src, id[1]);
                });
                if (o) {
                    var v = getPath.call(o, vl[1]);
                    updatePath.call(obj, vl[0], v);
                }
            });
        },

        // https://github.com/d3/d3-scale-chromatic
        colorize: function colorize(key) {
            var schemeKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : scheme;
            var opacity = arguments[2];

            var value = void 0,
                colorList = d3[schemeKey][9];
            if (arguments.length > 1) {

                var arr = _.data.map(function (x) {
                    return +x[key];
                });
                arr = [].concat(toConsumableArray(new Set(arr)));
                var r = [1, 8];
                _.scheme = schemeKey;
                _.minMax = d3.extent(arr);
                _.range = d3.range.apply(d3, r); //_.scale(2990000) - 2
                _.scale = d3.scaleLinear().domain(_.minMax).rangeRound(r);
                _.color = d3.scaleThreshold().domain(_.range).range(colorList);
                _.colorValues = colorList.map(function (color, id) {
                    value = Math.floor(_.scale.invert(id + 1.45));
                    return { id: id, color: color, value: value, totalValue: 0 };
                });
                _.data.forEach(function (obj) {
                    var vl = +obj[key];
                    var id = _.scale(vl);
                    if (opacity === undefined) {
                        obj.color = _.color(id);
                    } else {
                        var color = d3.color(_.color(id));
                        color.opacity = opacity;
                        obj.color = color + '';
                    }
                    obj.colorId = id - 1;
                    _.colorValues[obj.colorId].totalValue += vl;
                });
            }
            return _.colorValues;
        },
        colorScale: function colorScale(value) {
            var result = void 0;
            if (value !== undefined) {
                result = _.color(_.scale(+value));
            } else {
                result = { color: _.color, scale: _.scale, minMax: _.minMax };
            }
            return result;
        },
        setCss: function setCss(target, fl) {
            var hiden = void 0;
            if (fl === undefined && _.selectedColorId !== null) {
                fl = _.selectedColorId;
            }
            var texts = _.data.map(function (x) {
                if (fl === undefined || fl === x.colorId || fl === x.cid) {
                    hiden = 'opacity:1;fill:' + x.color + ';stroke:black';
                } else {
                    hiden = '';
                }
                return '.countries path.cid-' + x.cid + ' {' + hiden + ';}';
            });
            if (target) {
                _.targetCss = target;
            }
            d3.select(_.targetCss).text(texts.join("\n"));
        },
        setColorcountries: function setColorcountries(colorId) {
            var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'body';
            var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '.1f';

            var data = _.me.countries();
            var f = d3.format(format);
            d3.select(selector + ' .color-countries').remove();
            var colorCountries = d3.select(selector).append('div').attr('class', 'color-countries');
            colorCountries.append('div').attr('class', 'color-countries-title');
            var colorList = data.filter(function (x) {
                var value = x.properties.value;

                var vscale = _.scale(value);
                return vscale - 1 === colorId;
            });
            colorList.sort(function (a, b) {
                return b.properties.value - a.properties.value;
            });
            colorCountries.selectAll('div.color-countries-item').data(colorList).enter().append('div').attr('data-cid', function (d) {
                return d.properties.cid;
            }).attr('class', function (d) {
                var selected = d.properties.cid === _.cid ? 'selected' : '';
                return 'color-countries-item cid-' + d.properties.cid + ' ' + selected;
            }).html(function (d) {
                var _d$properties = d.properties,
                    cid = _d$properties.cid,
                    name = _d$properties.name,
                    value = _d$properties.value;

                return name + ': ' + f(value) + ' - ' + (cid ? cid : '&nbsp;-&nbsp;');
            });
            colorCountries.on('mouseover', function () {
                _.me.setCss(_.targetCss, d3.event.target.dataset.cid);
            }).on('mouseout', function () {
                _.me.setCss(_.targetCss);
            });
        },
        setColorRange: function setColorRange() {
            var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'body';
            var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.1f';

            var data = _.me.colorize();
            var f = d3.format(format);
            data.sort(function (a, b) {
                return b.value - a.value;
            });
            d3.select(selector + ' .color-range').remove();
            var colorRange = d3.select(selector).append('div').attr('class', 'color-range');
            colorRange.append('div').attr('class', 'color-range-title');
            var colorList = data.filter(function (x) {
                return x.totalValue !== 0;
            });
            _.colorItems = colorRange.selectAll('div.color-range-item').data(colorList).enter().append('div').attr('class', function (d) {
                return 'color-range-item s-' + d.id;
            }).style('background', function (d) {
                return d.color;
            }).text(function (d) {
                return f(d.totalValue);
            });
            _.colorItems.on('click', function (data) {
                _.me.setSelectedColor(data.id);
            }).on('mouseover', function (data) {
                _.me.setCss(_.targetCss, data.id);
                _.me.setColorcountries(data.id);
            }).on('mouseout', function () {
                _.me.setCss(_.targetCss);
                if (_.selectedColorId === null) {
                    _.me.setColorcountries(-2);
                } else {
                    _.me.setColorcountries(_.selectedColorId);
                }
            });
        },
        setSelectedColor: function setSelectedColor(colorId) {
            _.colorItems.classed('selected', false);
            if (_.selectedColorId !== colorId) {
                _.colorItems.filter('.s-' + colorId).classed('selected', true);
            } else {
                colorId = null;
            }
            _.selectedColorId = colorId;
            _.me.setColorcountries(colorId);
            _.me.setCss(_.targetCss);
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
        cid: function cid(id) {
            _.cid = id;
        }
    };
});

var countryNamesCsv = (function (csvUrl) {
    /*eslint no-console: 0 */
    var _ = { countryNames: null };

    return {
        name: 'countryNamesCsv',
        urls: csvUrl && [csvUrl],
        onReady: function onReady(err, csv) {
            _.me.data(csv);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(_data) {
            if (_data) {
                _.countryNames = _data;
            } else {
                return _.countryNames;
            }
        },
        mergeData: function mergeData(json, arr) {
            var cn = _.countryNames;
            var id = arr[0].split(':');
            var vl = arr[1].split(':');
            json.features.forEach(function (obj) {
                var o = cn.find(function (x) {
                    return '' + obj[id[0]] === x[id[1]];
                });
                if (o) {
                    obj[vl[0]] = o[vl[1]];
                }
            });
        }
    };
});

var colorScale = (function (data) {
    var _colorRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [d3.rgb('#FFAAFF'), d3.rgb("#FF0000")];

    /*eslint no-console: 0 */
    var _ = {};

    return {
        name: 'colorScale',
        onInit: function onInit(me) {
            _.me = me;
            _.me.data(data);
        },
        data: function data(_data) {
            _.mnMax = d3.extent(_data);
            _.color = d3.scaleLinear().domain(_.mnMax).interpolate(d3.interpolateHcl).range(_colorRange);
        },
        color: function color(value) {
            return _.color(value);
        },
        colors: function colors(arr) {
            return arr.map(function (x) {
                return _.color(x);
            });
        },
        colorScale: function colorScale(length) {
            var ttl = 0;
            var arr = [[0, _.me.color(0)]];
            var max = _.mnMax[1] / length;
            for (var i = 0; i < length; i++) {
                ttl += max;
                arr.push([ttl, _.me.color(ttl)]);
            }
            return arr;
        },
        colorRange: function colorRange(cRange) {
            if (cRange) {
                _colorRange = cRange;
            } else {
                return _colorRange;
            }
        }
    };
});

// http://bl.ocks.org/syntagmatic/6645345
var dotRegion = (function (jsonUrl) {
    var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.5;
    //
    /*eslint no-console: 0 */
    var _ = { recreate: true };

    function rgb2num(str) {
        return str.split(',').reduce(function (i, n) {
            return +i * 256 + +n;
        });
    }

    function num2rgb(num) {
        var d = num % 256;
        for (var i = 2; i > 0; i--) {
            num = Math.floor(num / 256);
            d = num % 256 + ',' + d;
        }
        return d;
    }

    function init() {
        var width = 1600;
        var height = 800;
        var center = [width / 2, height / 2];
        _.canvas = d3.select('body').append('canvas').attr('class', 'ej-hidden').attr('width', width).attr('height', height).node();
        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().translate(center).scale(center[1] / 1.2);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
    }

    function create() {
        if (_.recreate) {
            _.recreate = false;
            _.context.clearRect(0, 0, 1024, 512);
            var arr = _.dataDots.features;
            for (var i = 0; i < arr.length; i++) {
                _.context.beginPath();
                // _.path(arr[i]);
                var xy = _.proj(arr[i].geometry.coordinates);
                _.context.arc(xy[0], xy[1], radius, 0, 2 * Math.PI);
                _.context.fillStyle = 'rgb(' + num2rgb(i + 2) + ')';
                _.context.fill();
            }
        }
    }

    return {
        name: 'dotRegion',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.dataDots = _data;
            } else {
                return _.dataDots;
            }
        },
        detect: function detect(latlong) {
            // g._.proj.invert(mouse);
            var hiddenPos = _.proj(latlong);
            if (hiddenPos[0] > 0) {
                var p = _.context.getImageData(hiddenPos[0], hiddenPos[1], 1, 1).data;
                var d = _.dataDots.features[rgb2num(p.slice(0, 3).join(',')) - 2];
                if (d) {
                    var coordinates = d.geometry.coordinates;

                    if (Math.floor(coordinates[0]) === Math.floor(latlong[0]) && Math.floor(coordinates[1]) === Math.floor(latlong[1])) {
                        // console.log(latlong, coordinates);
                        return d;
                    }
                }
            }
        }
    };
});

var zoomPlugin = (function () {
    /*eslint no-console: 0 */
    var _ = {};

    function init() {
        var __ = this._;
        var s0 = __.proj.scale();
        var wh = [__.options.width, __.options.height];

        __.svg.call(d3.zoom().on('zoom start end', zoom).scaleExtent([0.1, 5]).translateExtent([[0, 0], wh]));

        function zoom() {
            var t = d3.event.transform;
            __.proj.scale(s0 * t.k);
            __.resize();
            __.refresh();
        }
    }

    return {
        name: 'zoomPlugin',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var hoverCanvas = (function () {
    /*eslint no-console: 0 */
    var _ = {
        svg: null,
        mouse: null,
        country: null,
        ocountry: null,
        countries: null,
        hoverHandler: null,
        onCircle: {},
        onCircleVals: [],
        onCountry: {},
        onCountryVals: []
    };

    function init() {
        if (this.worldCanvas) {
            var world = this.worldCanvas.data();
            if (world) {
                _.world = world;
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        var __ = this._;
        var _this = this;
        _.hoverHandler = function (event, mouse) {
            var _this2 = this;

            if (__.drag || !event) {
                return;
            }
            if (event.sourceEvent) {
                event = event.sourceEvent;
            }
            var xmouse = [event.clientX, event.clientY];
            var pos = __.proj.invert(mouse);
            _.pos = pos;
            _.dot = null;
            _.mouse = xmouse;
            _.country = null;
            if (__.options.showDots) {
                _.onCircleVals.forEach(function (v) {
                    _.dot = v.call(_this2, event, pos);
                });
            }
            if (__.options.showLand && _.countries && !_.dot) {
                if (!__.drag) {
                    if (_this.countryCanvas) {
                        _.country = _this.countryCanvas.detectCountry(pos);
                    } else {
                        _.country = findCountry(pos);
                    }
                    if (_.ocountry !== _.country && _this.canvasThreejs) {
                        _.ocountry = _.country;
                        _this.canvasThreejs.refresh();
                    }
                }
                _.onCountryVals.forEach(function (v) {
                    if (v.tooltips) {
                        v.call(_this2, event, _.country);
                    } else if (_.ocountry2 !== _.country) {
                        v.call(_this2, event, _.country);
                    }
                });
                _.ocountry2 = _.country;
            }
        };
        _.svg.on('mousemove', function () {
            _.hoverHandler.call(this, d3.event, d3.mouse(this));
        });
    }

    function findCountry(pos) {
        return _.countries.features.find(function (f) {
            return f.geometry.coordinates.find(function (c1) {
                return d3.polygonContains(c1, pos) || c1.find(function (c2) {
                    return d3.polygonContains(c2, pos);
                });
            });
        });
    }

    return {
        name: 'hoverCanvas',
        onInit: function onInit(me) {
            _.me = me;
            _.svg = this._.svg;
            // need to be call once as init() used in 2 places
            this._.options.showSelectedCountry = false;
            init.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.on('mousemove', null);
                _.svg = d3.selectAll(q);
                init.call(this);
            }
            return _.svg;
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.data(this.worldJson.data());
            }
        },
        onCircle: function onCircle(obj) {
            Object.assign(_.onCircle, obj);
            _.onCircleVals = Object.keys(_.onCircle).map(function (k) {
                return _.onCircle[k];
            });
        },
        onCountry: function onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryVals = Object.keys(_.onCountry).map(function (k) {
                return _.onCountry[k];
            });
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.countries = topojson.feature(_data, _data.objects.countries);
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    countries = _.countries;

                return { world: world, countries: countries };
            }
        },
        states: function states() {
            return {
                pos: _.pos,
                dot: _.dot,
                mouse: _.mouse,
                country: _.country
            };
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var clickCanvas = (function () {
    /*eslint no-console: 0 */
    var _ = {
        mouse: null,
        country: null,
        countries: null,
        onCircle: {},
        onCircleVals: [],
        onCountry: {},
        onCountryVals: []
    };

    function init() {
        if (this.worldCanvas) {
            var world = this.worldCanvas.data();
            if (world) {
                _.world = world;
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        var __ = this._;
        var _this = this;
        var mouseClickHandler = function mouseClickHandler(event, mouse) {
            var _this2 = this;

            if (!event) {
                return;
            }
            if (event.sourceEvent) {
                event = event.sourceEvent;
            }
            var xmouse = [event.clientX, event.clientY];
            var pos = __.proj.invert(mouse);
            _.pos = pos;
            _.dot = null;
            _.mouse = xmouse;
            _.country = null;
            if (__.options.showDots) {
                _.onCircleVals.forEach(function (v) {
                    _.dot = v.call(_this2, event, pos);
                });
            }
            if (__.options.showLand && !_.dot) {
                if (!__.drag) {
                    if (_this.countryCanvas) {
                        _.country = _this.countryCanvas.detectCountry(pos);
                    } else {
                        _.country = findCountry(pos);
                    }
                }
                _.onCountryVals.forEach(function (v) {
                    v.call(_this2, event, _.country);
                });
            }
        };
        var clickPlugin = this.mousePlugin || this.inertiaPlugin;
        if (clickPlugin) {
            clickPlugin.onClick({
                clickCanvas: mouseClickHandler
            });
        }
        __.options.showLand = true;
    }

    function findCountry(pos) {
        return _.countries.features.find(function (f) {
            return f.geometry.coordinates.find(function (c1) {
                return d3.polygonContains(c1, pos) || c1.find(function (c2) {
                    return d3.polygonContains(c2, pos);
                });
            });
        });
    }

    return {
        name: 'clickCanvas',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.data(this.worldJson.data());
            }
        },
        onCircle: function onCircle(obj) {
            Object.assign(_.onCircle, obj);
            _.onCircleVals = Object.keys(_.onCircle).map(function (k) {
                return _.onCircle[k];
            });
        },
        onCountry: function onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryVals = Object.keys(_.onCountry).map(function (k) {
                return _.onCountry[k];
            });
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.countries = topojson.feature(_data, _data.objects.countries);
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    countries = _.countries;

                return { world: world, countries: countries };
            }
        },
        state: function state() {
            return {
                pos: _.pos,
                dot: _.dot,
                mouse: _.mouse,
                country: _.country
            };
        }
    };
});

// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
var mousePlugin = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { zoomScale: [0, 50000] },
        zoomScale = _ref.zoomScale,
        intervalDrag = _ref.intervalDrag;

    /*eslint no-console: 0 */
    var _ = {
        svg: null,
        wait: null,
        zoom: null,
        mouse: null,
        q: null,
        sync: [],
        onDrag: {},
        onDragVals: [],
        onDragStart: {},
        onDragStartVals: [],
        onDragEnd: {},
        onDragEndVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: []
    };
    window._mouse = _;

    if (zoomScale === undefined) {
        zoomScale = [0, 50000];
    }

    function onclick() {
        _.onClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
    }

    function ondblclick() {
        _.onDblClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
    }

    var v0 = void 0,
        // Mouse position in Cartesian coordinates at start of drag gesture.
    r0 = void 0,
        // Projection rotation as Euler angles at start.
    q0 = void 0; // Projection rotation as versor at start.

    function r(__) {
        var versor = __.versor;
        var v1 = versor.cartesian(__.proj.rotate(r0).invert(_.mouse)),
            q1 = versor.multiply(q0, versor.delta(v0, v1));
        _.r = versor.rotation(q1);
    }

    function drag(__) {
        var _this = this;

        r(__);
        __.rotate(_.r);
        _.onDragVals.forEach(function (v) {
            v.call(_this, _.event, _.mouse);
        });
    }

    function init() {
        var __ = this._;
        var versor = __.versor;
        var s0 = __.proj.scale();
        var wh = [__.options.width, __.options.height];
        _.scale = d3.scaleLinear().domain([30, __.proj.scale()]).range([0.1, 1]);

        _.svg.call(d3.drag().on('start', onStartDrag).on('drag', onDragging).on('end', onEndDrag));

        _.zoom = d3.zoom().on('zoom', zoom).scaleExtent([0.1, 160]).translateExtent([[0, 0], wh]).filter(function () {
            var _d3$event = d3.event,
                touches = _d3$event.touches,
                type = _d3$event.type;

            return type === 'wheel' || touches;
        });

        _.svg.call(_.zoom);

        // todo: add zoom lifecycle to optimize plugins zoom-able
        // ex: barTooltipSvg, at the end of zoom, need to recreate
        function zoom() {
            var z = zoomScale;
            var r1 = s0 * d3.event.transform.k;
            if (r1 >= z[0] && r1 <= z[1]) {
                __.scale(r1);
                _.sync.forEach(function (g) {
                    return g._.scale(r1);
                });
            }
        }

        function rotate(r) {
            var d = r[0] - r0[0];
            r[0] = d + this._.proj.rotate()[0];
            if (r[0] >= 180) r[0] -= 360;
            this._.rotate(r);
        }

        function onStartDrag() {
            var _this2 = this;

            var mouse = d3.mouse(this);
            v0 = versor.cartesian(__.proj.invert(mouse));
            r0 = __.proj.rotate();
            q0 = versor(r0);
            __.drag = null;
            _.onDragStartVals.forEach(function (v) {
                return v.call(_this2, _.event, mouse);
            });
            _.onDragVals.forEach(function (v) {
                return v.call(_this2, _.event, mouse);
            });
            __.refresh();
            _.mouse = mouse;
            _._this = this;
            _.t1 = 0;
            _.t2 = 0;
        }

        function onDragging() {
            // DOM update must be onInterval!
            __.drag = true;
            _._this = this;
            _.mouse = d3.mouse(this);
            !intervalDrag && drag(__);
            // _.t1+=1; // twice call compare to onInterval
        }

        function onEndDrag() {
            var _this3 = this;

            var drag = __.drag;
            __.drag = false;
            if (drag === null) {
                _.event = d3.event;
                if (__.options.spin) {
                    onclick();
                } else if (_.wait) {
                    _.wait = null;
                    ondblclick();
                } else if (_.wait === null) {
                    _.wait = setTimeout(function () {
                        if (_.wait) {
                            _.wait = false;
                        }
                    }, 250);
                }
            } else if (drag) {
                r(__);
                __.rotate(_.r);
                _.onDragVals.forEach(function (v) {
                    return v.call(_._this, _.event, _.mouse);
                });
                _.sync.forEach(function (g) {
                    return rotate.call(g, _.r);
                });
            }
            _.onDragEndVals.forEach(function (v) {
                return v.call(_this3, _.event, _.mouse);
            });
            __.refresh();
            // console.log('ttl:',_.t1,_.t2);
        }
    }

    function interval() {
        var __ = this._;
        if (__.drag && intervalDrag) {
            if (_.oMouse[0] !== _.mouse[0] && _.oMouse[1] !== _.mouse[1]) {
                _.oMouse = _.mouse;
                drag(__);
                // _.t2+=1;
            }
        } else if (_.wait === false) {
            _.wait = null;
            onclick();
        }
    }

    return {
        name: 'mousePlugin',
        onInit: function onInit(me) {
            _.me = me;
            _.oMouse = [];
            _.svg = this._.svg;
            init.call(this);
        },
        onInterval: function onInterval() {
            interval.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.call(d3.drag().on('start', null).on('drag', null).on('end', null));
                _.svg.call(d3.zoom().on('zoom', null));
                _.svg = d3.selectAll(q);
                init.call(this);
                if (this.hoverCanvas) {
                    this.hoverCanvas.selectAll(q);
                }
            }
            return _.svg;
        },
        sync: function sync(arr) {
            _.sync = arr;
        },
        zoom: function zoom(k) {
            _.zoom.scaleTo(_.svg, k ? _.scale(k) : 1);
        },
        mouse: function mouse() {
            return _.mouse;
        },
        onDrag: function onDrag(obj) {
            Object.assign(_.onDrag, obj);
            _.onDragVals = Object.keys(_.onDrag).map(function (k) {
                return _.onDrag[k];
            });
        },
        onDragStart: function onDragStart(obj) {
            Object.assign(_.onDragStart, obj);
            _.onDragStartVals = Object.keys(_.onDragStart).map(function (k) {
                return _.onDragStart[k];
            });
        },
        onDragEnd: function onDragEnd(obj) {
            Object.assign(_.onDragEnd, obj);
            _.onDragEndVals = Object.keys(_.onDragEnd).map(function (k) {
                return _.onDragEnd[k];
            });
        },
        onClick: function onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(function (k) {
                return _.onClick[k];
            });
        },
        onDblClick: function onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(function (k) {
                return _.onDblClick[k];
            });
        }
    };
});

// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
var canvasPlugin = (function () {
    /*eslint no-console: 0 */
    var _ = {
        contexts: [],
        canvas: null,
        path: null,
        q: null
    };
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showCanvas = true;
        _.path = d3.geoPath().projection(__.proj);
    }

    function create() {
        var __ = this._;
        if (__.options.showCanvas) {
            if (!_.canvas) {
                $.g = __.svg.append('g').attr('class', _.me.name);
                var fObject = $.g.append('foreignObject').attr('x', 0).attr('y', 0).attr('width', __.options.width).attr('height', __.options.height);
                var fBody = fObject.append('xhtml:body').style('margin', '0px').style('padding', '0px').style('background-color', 'none').style('width', __.options.width + 'px').style('height', __.options.height + 'px');
                _.canvas = fBody.append('canvas');
            }
            _.canvas.attr('x', 0).attr('y', 0).attr('width', __.options.width).attr('height', __.options.height);
            _.contexts = _.canvas.nodes().map(function (obj) {
                return obj.getContext('2d');
            });
        }
        if (_.canvas) {
            refresh.call(this);
        }
    }

    function refresh() {
        var _$options = this._.options,
            width = _$options.width,
            height = _$options.height;

        var l = _.contexts.length;
        while (l--) {
            _.contexts[l].clearRect(0, 0, width, height);
        }
    }

    return {
        name: 'canvasPlugin',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.canvas = d3.selectAll(q);
            }
            return _.canvas;
        },
        render: function render(fn, drawTo) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

            var __ = this._;
            if (__.options.showCanvas) {
                var rChange = false;
                var proj = __.proj;
                var r = proj.rotate();
                var _this = this;
                _.canvas.each(function (obj, idx) {
                    if (!drawTo || drawTo.indexOf(idx) > -1) {
                        var o = options[idx] || {};
                        if (o.rotate) {
                            rChange = true;
                            proj.rotate([r[0] + o.rotate, r[1], r[2]]);
                        } else if (rChange) {
                            rChange = false;
                            proj.rotate(r);
                        }
                        var context = this.getContext('2d');
                        fn.call(_this, context, _.path.context(context));
                    }
                });
                if (rChange) {
                    rChange = false;
                    proj.rotate(r);
                }
            }
        },
        flipRender: function flipRender(fn, drawTo) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

            // __.proj.clipAngle(180);
            // _.me.render(function(context, path) {
            //     fn.call(this, context, path);
            // }, _.drawTo, _.options);
            // __.proj.clipAngle(90);
            var __ = this._;
            var w = __.center[0];
            var r = __.proj.rotate();
            _.me.render(function (context, path) {
                context.save();
                context.translate(w, 0);
                context.scale(-1, 1);
                context.translate(-w, 0);
                __.proj.rotate([r[0] + 180, -r[1], -r[2]]);
                fn.call(this, context, path);
                context.restore();
                __.proj.rotate(r);
            }, drawTo, options);
        }
    };
});

// https://armsglobe.chromeexperiments.com/
var inertiaPlugin = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { zoomScale: [0, 50000] },
        zoomScale = _ref.zoomScale;

    /*eslint no-console: 0 */
    var _ = {
        sync: [],
        onDrag: {},
        onDragVals: [],
        onDragStart: {},
        onDragStartVals: [],
        onDragEnd: {},
        onDragEndVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: [],
        stalledDrag: 0
    };

    var rotateX = 0,
        rotateY = 0,
        rotateZ = [],
        rotateVX = 0,
        rotateVY = 0,
        previousX = 0,
        previousY = 0;

    var dragging = false,
        rendering = false,
        draggMove = undefined;

    function onclick() {
        _.onClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
    }

    function ondblclick() {
        _.onDblClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
    }

    function stopDrag() {
        var _this = this;

        _.this._.drag = false;
        _.this._.refresh();
        _.onDragEndVals.forEach(function (v) {
            return v.call(_this, _.event, _.mouse);
        });
    }

    var scaleX = d3.scaleLinear().domain([65.3, 184.5]).range([0.60, 0.25]);
    var scaleY = d3.scaleLinear().domain([65.3, 184.5]).range([0.55, 0.20]);

    function inertiaDrag() {
        var _this2 = this;

        _.onDragVals.forEach(function (v) {
            return v.call(_this2, _.event, _.mouse);
        });
        if (!rendering) {
            _.removeEventQueue(_.me.name, 'onTween');
            stopDrag();
            return;
        }

        rotateVX *= 0.99;
        rotateVY *= 0.90;

        if (dragging) {
            rotateVX *= _.dragX; // 0.25;
            rotateVY *= _.dragY; // 0.20;
        }

        if (rotateY < -100) {
            rotateY = -100;
            rotateVY *= -0.95;
        }

        if (rotateY > 100) {
            rotateY = 100;
            rotateVY *= -0.95;
        }

        rotateX += rotateVX;
        rotateY += rotateVY;

        var r = [rotateX, rotateY, rotateZ[2]];
        var l = _.sync.length;
        _.rotate(r);
        while (l--) {
            _.sync[l]._.rotate(r);
        }

        if (!dragging && previousX.toPrecision(5) === rotateX.toPrecision(5) && previousY.toPrecision(5) === rotateY.toPrecision(5)) {
            rendering = false;
        }
        previousX = rotateX;
        previousY = rotateY;
    }

    function mouseMovement() {
        _.event = d3.event;
        _.mouse = d3.mouse(this);
        var sourceEvent = _.event.sourceEvent;

        if (sourceEvent) {
            // sometime sourceEvent=null
            var t = sourceEvent.touches ? sourceEvent.touches[0] : sourceEvent;
            return [t.clientX, -t.clientY];
        }
    }

    var cmouse = void 0,
        pmouse = void 0;
    function onStartDrag() {
        var _this3 = this;

        rotateVX = 0;
        rotateVY = 0;
        dragging = true;
        rendering = true;
        draggMove = null;
        cmouse = mouseMovement.call(this);
        _.onDragStartVals.forEach(function (v) {
            return v.call(_this3, _.event, _.mouse);
        });
        _.onDragVals.forEach(function (v) {
            return v.call(_this3, _.event, _.mouse);
        });
        _.removeEventQueue(_.me.name, 'onTween');
        _.addEventQueue(_.me.name, 'onInterval');
        _.this._.drag = null;
    }

    function onDragging() {
        if (dragging) {
            draggMove = true;
            pmouse = cmouse;
            cmouse = mouseMovement.call(this);
            if (cmouse) {
                // sometime sourceEvent=null
                rotateZ = _.proj.rotate();
                rotateX = rotateZ[0];
                rotateY = rotateZ[1];
                rotateVX += cmouse[0] - pmouse[0];
                rotateVY += cmouse[1] - pmouse[1];
                inertiaDrag.call(_.this);
            } else {
                cmouse = pmouse;
            }
            _.this._.drag = true;
            _.stalledDrag = 0;
            _._this = this;
        }
    }

    function onEndDrag() {
        dragging = false;
        _.removeEventQueue(_.me.name, 'onInterval');
        if (draggMove) {
            draggMove = false;
            _.addEventQueue(_.me.name, 'onTween');
        } else {
            stopDrag();
            _.event = d3.event;
            if (draggMove === null) {
                if (_.wait) {
                    clearTimeout(_.wait);
                    _.wait = null;
                    ondblclick();
                } else {
                    _.wait = setTimeout(function () {
                        _.wait = false;
                        onclick();
                    }, 250);
                }
            }
        }
    }

    function init() {
        var __ = this._;
        var s0 = __.proj.scale();
        function zoomAndDrag() {
            var _d3$event$sourceEvent = d3.event.sourceEvent,
                type = _d3$event$sourceEvent.type,
                touches = _d3$event$sourceEvent.touches;

            if (type === 'wheel' || touches && touches.length === 2) {
                var r1 = s0 * d3.event.transform.k;
                if (r1 >= zoomScale[0] && r1 <= zoomScale[1]) {
                    var l = _.sync.length;
                    __.scale(r1);
                    while (l--) {
                        _.sync[l]._.scale(r1);
                    }
                }
                rotateVX = 0;
                rotateVY = 0;
            } else {
                onDragging.call(this);
            }
        }

        var _$options = __.options,
            width = _$options.width,
            height = _$options.height;

        _.svg.call(d3.zoom().on("start", onStartDrag).on('zoom', zoomAndDrag).on("end", onEndDrag).scaleExtent([0.1, 160]).translateExtent([[0, 0], [width, height]]));
    }

    function create() {
        _.proj = this._.proj;
        _.rotate = this._.rotate;
        _.addEventQueue = this.__addEventQueue;
        _.removeEventQueue = this.__removeEventQueue;
        _.removeEventQueue(_.me.name, 'onInterval');
        var r = _.proj.scale();
        r = r > 200 ? 200 : r; // 184.5
        _.dragX = scaleX(r);
        _.dragY = scaleY(r);
    }

    function resize() {
        var r = _.proj.scale();
        r = r > 200 ? 200 : r; // 184.5
        _.dragX = scaleX(r);
        _.dragY = scaleY(r);
    }

    return {
        name: 'inertiaPlugin',
        onInit: function onInit(me) {
            _.me = me;
            _.this = this;
            _.svg = this._.svg;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.call(d3.zoom().on('start', null).on('zoom', null).on('end', null));
                _.svg = d3.selectAll(q);
                init.call(this);
                if (this.hoverCanvas) {
                    this.hoverCanvas.selectAll(q);
                }
            }
            return _.svg;
        },
        onInterval: function onInterval() {
            if (draggMove && _.stalledDrag++ > 10) {
                // reset inertia
                _.stalledDrag = 0;
                rotateVX = 0;
                rotateVY = 0;
            }
        },
        onTween: function onTween() {
            // requestAnimationFrame()
            inertiaDrag.call(this);
        },
        sync: function sync(arr) {
            _.sync = arr;
        },
        onDrag: function onDrag(obj) {
            Object.assign(_.onDrag, obj);
            _.onDragVals = Object.keys(_.onDrag).map(function (k) {
                return _.onDrag[k];
            });
        },
        onDragStart: function onDragStart(obj) {
            Object.assign(_.onDragStart, obj);
            _.onDragStartVals = Object.keys(_.onDragStart).map(function (k) {
                return _.onDragStart[k];
            });
        },
        onDragEnd: function onDragEnd(obj) {
            Object.assign(_.onDragEnd, obj);
            _.onDragEndVals = Object.keys(_.onDragEnd).map(function (k) {
                return _.onDragEnd[k];
            });
        },
        stopDrag: function stopDrag() {
            rendering = false;
        },
        onClick: function onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(function (k) {
                return _.onClick[k];
            });
        },
        onDblClick: function onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(function (k) {
                return _.onDblClick[k];
            });
        }
    };
});

// http://bl.ocks.org/syntagmatic/6645345
var countryCanvas = (function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = { recreate: true };

    function init() {
        _.canvas = d3.select('body').append('canvas').attr('class', 'ej-hidden').attr('width', '1024').attr('height', '512').node();
        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().precision(0.5).translate([512, 256]).scale(163);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
    }

    function create() {
        if (_.recreate) {
            _.recreate = false;
            _.context.clearRect(0, 0, 1024, 512);
            var i = _.countries.features.length;
            while (i--) {
                _.context.beginPath();
                _.path(_.countries.features[i]);
                _.context.fillStyle = "rgb(" + (i + 1) + ",0,0)";
                _.context.fill();
            }
        }
    }

    return {
        name: 'countryCanvas',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.data(this.worldJson.data());
            }
            create.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.countries = topojson.feature(_data, _data.objects.countries);
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    countries = _.countries;

                return { world: world, countries: countries };
            }
        },
        detectCountry: function detectCountry(pos) {
            var hiddenPos = _.proj(pos);
            if (hiddenPos[0] > 0) {
                var p = _.context.getImageData(hiddenPos[0], hiddenPos[1], 1, 1).data;
                return _.countries.features[p[0] - 1];
            }
        }
    };
});

// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
// http://bl.ocks.org/kenpenn/16a9c611417ffbfc6129
// https://stackoverflow.com/questions/42392777/three-js-buffer-management
var threejsPlugin = (function () {
    var threejs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'three-js';

    /*eslint no-console: 0 */
    var _ = { renderer: null, scene: null, camera: null };
    var manager = new THREE.LoadingManager();
    var loader = new THREE.TextureLoader(manager);
    var SCALE = void 0;

    // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
    function _vertex(point, r) {
        var lambda = point[0] * Math.PI / 180,
            phi = point[1] * Math.PI / 180,
            cosPhi = Math.cos(phi);
        return new THREE.Vector3(r * cosPhi * Math.cos(lambda), r * Math.sin(phi), -r * cosPhi * Math.sin(lambda));
    }

    // Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
    function _wireframe(multilinestring, material, r) {
        var geometry = new THREE.Geometry();
        multilinestring.coordinates.forEach(function (line) {
            d3.pairs(line.map(function (p) {
                return _vertex(p, r);
            }), function (a, b) {
                geometry.vertices.push(a, b);
            });
        });
        return new THREE.LineSegments(geometry, material);
    }

    function init() {
        var __ = this._;
        SCALE = __.proj.scale();
        var _$options = __.options,
            width = _$options.width,
            height = _$options.height;

        var canvas = document.getElementById(threejs);
        _.scale = d3.scaleLinear().domain([0, SCALE]).range([0, 1]);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 30000);
        _.light = new THREE.PointLight(0xffffff, 0);
        _.scene = new THREE.Scene();
        _.group = new THREE.Group();
        _.node = canvas;
        _.camera.position.z = 3010; // (higher than RADIUS + size of the bubble)
        _.camera.name = 'camera';
        _.group.name = 'group';
        _.light.name = 'light';
        _.scene.add(_.camera);
        _.scene.add(_.group);
        _.camera.add(_.light);

        _.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        _.renderer.sortObjects = true;
        this.renderThree = _renderThree;
        if (window.THREEx && window.THREEx.DomEvents) {
            _.domEvents = new window.THREEx.DomEvents(_.camera, _.renderer.domElement);
        }
        Object.defineProperty(_.me, 'group', {
            get: function get() {
                return _.group;
            }
        });
        Object.defineProperty(_.me, 'camera', {
            get: function get() {
                return _.camera;
            }
        });
        Object.defineProperty(_.me, 'renderer', {
            get: function get() {
                return _.renderer;
            }
        });
        Object.defineProperty(_.me, 'domEvents', {
            get: function get() {
                return _.domEvents;
            }
        });
    }

    function _scale(obj) {
        if (!obj) {
            obj = _.group;
        }
        var sc = _.scale(this._.proj.scale());
        obj.scale.x = sc;
        obj.scale.y = sc;
        obj.scale.z = sc;
        _renderThree.call(this);
    }

    function _rotate(obj) {
        var direct = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        var __ = this._;
        var rt = __.proj.rotate();
        rt[0] -= 90;
        var q1 = __.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        (obj || _.group).setRotationFromQuaternion(q2);
        _renderThree.call(this, direct, false, delay);
    }

    var renderThreeX = null;
    function _renderThree() {
        var _this = this;

        var direct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var fn = arguments[1];

        if (direct) {
            _.renderer.render(_.scene, _.camera);
            if (renderThreeX) {
                renderThreeX = null;
                clearTimeout(renderThreeX);
            }
        } else if (renderThreeX === null) {
            renderThreeX = setTimeout(function () {
                fn && fn.call(_this, _.group);
                _.renderer.render(_.scene, _.camera);
                renderThreeX = null;
            }, 0);
        }
    }

    return {
        name: 'threejsPlugin',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            _.group.children = [];
            _rotate.call(this);
        },
        onRefresh: function onRefresh() {
            _rotate.call(this, null, true);
        },
        onResize: function onResize() {
            _scale.call(this);
        },
        addGroup: function addGroup(obj) {
            var _this2 = this;

            _.group.add(obj);
            if (obj.name && this[obj.name]) {
                this[obj.name].add = function () {
                    _.group.add(obj);
                    _this2.__addEventQueue(obj.name);
                    _renderThree.call(_this2);
                };
                this[obj.name].remove = function () {
                    _.group.remove(obj);
                    _this2.__removeEventQueue(obj.name);
                    _renderThree.call(_this2);
                };
                this[obj.name].isAdded = function () {
                    return _.group.children.filter(function (x) {
                        return x.name === obj.name;
                    }).length > 0;
                };
            }
        },
        emptyGroup: function emptyGroup() {
            var arr = _.group.children;
            var ttl = arr.length;
            for (var i = ttl - 1; i > -1; --i) {
                var obj = arr[i];
                _.group.remove(obj);
                obj.name && this.__removeEventQueue(obj.name);
                _renderThree.call(this);
            }
        },
        scale: function scale(obj) {
            _scale.call(this, obj);
        },
        rotate: function rotate(obj) {
            _rotate.call(this, obj);
        },
        vertex: function vertex(point) {
            var r = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SCALE;

            return _vertex(point, r);
        },
        wireframe: function wireframe(multilinestring, material) {
            var r = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : SCALE;

            return _wireframe(multilinestring, material, r);
        },
        texture: function texture(imgUrl) {
            var _this3 = this;

            return loader.load(imgUrl, function (image) {
                _renderThree.call(_this3);
                return image;
            });
        },
        renderThree: function renderThree() {
            _renderThree.call(this);
        },
        light: function light() {
            return _.camera.children[0];
        },
        node: function node() {
            return _.node;
        },
        q2rotate: function q2rotate() {
            var q = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _.group.quaternion;

            var trans = [q._w, q._y, -q._x, q._z];
            var euler = this._.versor.rotation(trans);
            euler[0] += 90;
            return euler;
        },
        light3d: function light3d() {
            var sphereObject = new THREE.Group();
            var ambient = new THREE.AmbientLight(0x777777);
            var light1 = new THREE.DirectionalLight(0xffffff);
            var light2 = new THREE.DirectionalLight(0xffffff);
            light1.position.set(1, 0, 1);
            light2.position.set(-1, 0, 1);
            sphereObject.add(ambient);
            sphereObject.add(light1);
            sphereObject.add(light2);
            return sphereObject;
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var dblClickCanvas = (function () {
    /*eslint no-console: 0 */
    var _ = {
        mouse: null,
        country: null,
        countries: null,
        onCircle: {},
        onCircleVals: [],
        onCountry: {},
        onCountryVals: []
    };

    function findCountry(pos) {
        return _.countries.features.find(function (f) {
            return f.geometry.coordinates.find(function (c1) {
                return d3.polygonContains(c1, pos) || c1.find(function (c2) {
                    return d3.polygonContains(c2, pos);
                });
            });
        });
    }

    function initmouseClickHandler() {
        if (this.worldCanvas) {
            var world = this.worldCanvas.data();
            if (world) {
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        var __ = this._;
        var _this = this;
        var mouseDblClickHandler = function mouseDblClickHandler(event, mouse) {
            var _this2 = this;

            if (!event) {
                return;
            }
            if (event.sourceEvent) {
                event = event.sourceEvent;
            }
            var xmouse = [event.clientX, event.clientY];
            var pos = __.proj.invert(mouse);
            _.pos = pos;
            _.dot = null;
            _.mouse = xmouse;
            _.country = null;
            if (__.options.showDots) {
                _.onCircleVals.forEach(function (v) {
                    _.dot = v.call(_this2, event, pos);
                });
            }
            if (__.options.showLand && !_.dot) {
                if (!__.drag) {
                    if (_this.countryCanvas) {
                        _.country = _this.countryCanvas.detectCountry(pos);
                    } else {
                        _.country = findCountry(pos);
                    }
                }
                _.onCountryVals.forEach(function (v) {
                    v.call(_this2, event, _.country);
                });
            }
        };
        var dblClickPlugin = this.mousePlugin || this.inertiaPlugin;
        if (dblClickPlugin) {
            dblClickPlugin.onDblClick({
                dblClickCanvas: mouseDblClickHandler
            });
        }
        __.options.showLand = true;
    }

    return {
        name: 'dblClickCanvas',
        onInit: function onInit(me) {
            _.me = me;
            initmouseClickHandler.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.data(this.worldJson.data());
            }
        },
        onCircle: function onCircle(obj) {
            Object.assign(_.onCircle, obj);
            _.onCircleVals = Object.keys(_.onCircle).map(function (k) {
                return _.onCircle[k];
            });
        },
        onCountry: function onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryVals = Object.keys(_.onCountry).map(function (k) {
                return _.onCountry[k];
            });
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.countries = topojson.feature(_data, _data.objects.countries);
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    countries = _.countries;

                return { world: world, countries: countries };
            }
        },
        state: function state() {
            return {
                pos: _.pos,
                dot: _.dot,
                mouse: _.mouse,
                country: _.country
            };
        }
    };
});

var autorotatePlugin = (function () {
    var degPerSec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

    /*eslint no-console: 0 */
    var _ = {
        lastTick: new Date(),
        degree: degPerSec / 1000,
        sync: []
    };

    function create() {
        var o = this._.options;
        if (this.clickCanvas) {
            this.clickCanvas.onCountry({
                autorotatePlugin: function autorotatePlugin(e, country) {
                    if (!country) {
                        o.spin = !o.spin;
                    }
                }
            });
        }
    }

    var start = 0;
    function interval(timestamp) {
        if (timestamp - start > 40) {
            start = timestamp;
            var now = new Date();
            if (this._.options.spin && this._.drag === false) {
                var delta = now - _.lastTick;
                rotate.call(this, delta);
                _.sync.forEach(function (g) {
                    return rotate.call(g, delta);
                });
            }
            _.lastTick = now;
        }
    }

    function rotate(delta) {
        var r = this._.proj.rotate();
        r[0] += _.degree * delta;
        this._.rotate(r);
    }

    return {
        name: 'autorotatePlugin',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.spin = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onInterval: function onInterval(t) {
            interval.call(this, t);
        },
        speed: function speed(degPerSec) {
            _.degree = degPerSec / 1000;
        },
        sync: function sync(arr) {
            _.sync = arr;
        },
        start: function start() {
            this._.options.spin = true;
        },
        stop: function stop() {
            this._.options.spin = false;
        },
        spin: function spin(rotate) {
            if (rotate !== undefined) {
                this._.options.spin = rotate;
            } else {
                return this._.options.spin;
            }
        }
    };
});

var barSvg = (function (urlBars) {
    /*eslint no-console: 0 */
    var _ = { svg: null, barProjection: null, q: null, bars: null, valuePath: null };
    var $ = {};
    var scale50 = d3.scaleLinear().domain([0, 200]).range([5, 50]);

    function init() {
        var __ = this._;
        __.options.showBars = true;
        _.barProjection = __.projection();
        _.svg = __.svg;
    }

    function create() {
        var __ = this._;
        var klas = _.me.name;
        svgClipPath.call(this);
        _.svg.selectAll('.bar.' + klas).remove();
        if (_.bars && __.options.showBars) {
            var gBar = _.svg.append('g').attr('class', 'bar ' + klas);
            var mask = gBar.append('mask').attr('id', 'edge');
            mask.append('rect').attr('x', 0).attr('y', 0).attr('width', '100%').attr('height', '100%').attr('fill', 'white');
            mask.append('use').attr('xlink:href', '#edgeCircle').attr('fill', 'black');

            _.max = d3.max(_.bars.features, function (d) {
                return parseInt(d.geometry.value);
            });

            var r = __.proj.scale();
            _.heightScale = d3.scaleLinear().domain([0, _.max]).range([r, r + scale50(r)]);

            $.bar = gBar.selectAll('line').data(_.bars.features).enter().append('line').attr('stroke', 'red').attr('stroke-width', '2').attr('data-index', function (d, i) {
                return i;
            });
            refresh.call(this);
        }
    }

    function refresh() {
        var __ = this._;
        if (_.bars && __.options.showBars) {
            var proj1 = __.proj;
            var scale = _.heightScale;
            var proj2 = _.barProjection;
            var center = proj1.invert(__.center);
            proj2.rotate(this._.proj.rotate());
            $.bar.each(function (d) {
                var arr = d.geometry.coordinates;
                proj2.scale(scale(d.geometry.value));
                var distance = d3.geoDistance(arr, center);
                var d1 = proj1(arr);
                var d2 = proj2(arr);
                d3.select(this).attr('x1', d1[0]).attr('y1', d1[1]).attr('x2', d2[0]).attr('y2', d2[1]).attr('mask', distance < 1.57 ? null : 'url(#edge)');
            });
        }
    }

    function svgClipPath() {
        var __ = this._;
        this.$slc.defs.selectAll('clipPath').remove();
        this.$slc.defs.append('clipPath').append('circle').attr('id', 'edgeCircle').attr('cx', __.center[0]).attr('cy', __.center[1]).attr('r', __.proj.scale());
    }

    return {
        name: 'barSvg',
        urls: urlBars && [urlBars],
        onReady: function onReady(err, bars) {
            _.me.data(bars);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        onResize: function onResize() {
            create.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        valuePath: function valuePath(path) {
            _.valuePath = path;
        },
        data: function data(_data) {
            var _this = this;

            if (_data) {
                if (_.valuePath) {
                    var p = _.valuePath.split('.');
                    _data.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) {
                            return v = v[o];
                        });
                        d.geometry.value = v;
                    });
                }
                _.bars = _data;
                setTimeout(function () {
                    return refresh.call(_this);
                }, 1);
            } else {
                return _.bars;
            }
        },
        $bar: function $bar() {
            return $.bar;
        }
    };
});

var mapSvg = (function (worldUrl) {
    var flexbox = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.ej-flexbox';

    /*eslint no-console: 0 */
    var _ = {
        q: null,
        svg: null,
        world: null,
        land: null,
        onCountry: {},
        onCountryVals: [],
        selectedCountry: null,
        lakes: { type: 'FeatureCollection', features: [] },
        selected: { type: 'FeatureCollection', features: [] },
        countries: { type: 'FeatureCollection', features: [] }
    };
    var $ = {};
    _.mapTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

    function init() {
        _.svg = this._.svg;
        var _$options = this._.options,
            width = _$options.width,
            height = _$options.height;

        var scale = width / 6.279;
        _.zoom = d3.zoom().on('zoom', function () {
            return $.g.attr('transform', d3.event.transform);
        });
        _.proj = d3.geoEquirectangular().scale(scale).translate([width / 2, height / 2]);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
        _.svg.call(_.zoom);
    }

    function show(data, tooltip) {
        var props = data.properties;
        var title = Object.keys(props).map(function (k) {
            return k + ': ' + props[k];
        }).join('<br/>');
        return tooltip.html(title);
    }

    function create() {
        var _this = this;
        var klas = _.me.name;
        _.flexBox = d3.selectAll(flexbox);
        _.svg.selectAll('.countries.' + klas).remove();
        if (this._.options.showMap) {
            $.g = _.svg.append('g').attr('class', 'countries ' + klas);
            $.countries = $.g.selectAll('path').data(_.countries.features).enter().append('path').attr('class', function (d) {
                return 'cid-' + d.properties.cid;
            }).attr('id', function (d) {
                return 'x' + d.id;
            });

            $.countries.on('click', function (d) {
                var _this2 = this;

                var cid = d.properties.cid;
                $.countries.classed('selected', false);
                if (_this.choroplethCsv) {
                    var oscale = -1;
                    var v = _this.choroplethCsv.colorScale();
                    var vscale = v.scale(d.properties.value);
                    if (_.selectedCountry) {
                        oscale = v.scale(_.selectedCountry.properties.value);
                    }
                    if (oscale !== vscale || _.selectedCountry === d) {
                        _this.choroplethCsv.setSelectedColor(vscale - 1);
                    }
                    _this.choroplethCsv.cid(cid);
                    d3.selectAll('.color-countries-item').classed('selected', false);
                    d3.selectAll('.color-countries-item.cid-' + cid).classed('selected', true);
                }
                if (_.selectedCountry !== d) {
                    _.selectedCountry = d;
                    $.countries.filter('#x' + d.id).classed('selected', true);
                } else {
                    _.selectedCountry = null;
                }
                _.onCountryVals.forEach(function (v) {
                    v.call(_this2, d3.event, d);
                });
            }).on('mouseover', function (data) {
                var _d3$event = d3.event,
                    pageX = _d3$event.pageX,
                    pageY = _d3$event.pageY;

                (_.me.show || show)(data, _.mapTooltip).style('display', 'block').style('left', pageX + 7 + 'px').style('top', pageY - 15 + 'px');
                _.flexBox.style('display', 'flex');
            }).on('mouseout', function (data) {
                if (_.me.hide) {
                    _.me.hide(data, _.mapTooltip);
                }
                _.mapTooltip.style('display', 'none');
                if (_.selectedCountry === null) {
                    _.flexBox.style('display', 'none');
                }
            }).on('mousemove', function () {
                var _d3$event2 = d3.event,
                    pageX = _d3$event2.pageX,
                    pageY = _d3$event2.pageY;

                _.mapTooltip.style('left', pageX + 7 + 'px').style('top', pageY - 15 + 'px');
            });
            refresh.call(this);
        }
    }

    function refresh() {
        var __ = this._;
        if (__.options.showMap) {
            $.countries.attr('d', _.path);
        }
    }

    return {
        name: 'mapSvg',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            var __ = this._;
            var options = __.options;
            options.showMap = true;
            init.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        onCountry: function onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryVals = Object.keys(_.onCountry).map(function (k) {
                return _.onCountry[k];
            });
        },
        selectedCountry: function selectedCountry() {
            return _.selectedCountry;
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.land = topojson.feature(_data, _data.objects.land);
                _.countries.features = topojson.feature(_data, _data.objects.countries).features;
                if (_data.objects.ne_110m_lakes) _.lakes.features = topojson.feature(_data, _data.objects.ne_110m_lakes).features;
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.land = all.land;
                _.lakes = all.lakes;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    land = _.land,
                    lakes = _.lakes,
                    countries = _.countries;

                return { world: world, land: land, lakes: lakes, countries: countries };
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        resetZoom: function resetZoom() {
            _.svg.call(_.zoom.transform, d3.zoomIdentity);
        }
    };
});

var haloSvg = (function () {
    var haloColor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '#fff';

    var _ = { svg: null, q: null };
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showHalo = true;
        _.svg = __.svg;
    }

    function create() {
        var klas = _.me.name;
        _.svg.selectAll('#halo,.halo.' + klas).remove();
        if (this._.options.showHalo) {
            this.$slc.defs.append('radialGradient').attr('id', 'halo').attr('cx', '50%').attr('cy', '50%').html('\n<stop offset="85%" stop-color="' + haloColor + '" stop-opacity="1"></stop>\n<stop offset="100%" stop-color="' + haloColor + '" stop-opacity="0"></stop>\n');
            $.halo = _.svg.append('g').attr('class', 'halo ' + klas).append('ellipse').attr('class', 'noclicks').attr('cx', this._.center[0]).attr('cy', this._.center[1]);
            resize.call(this);
        }
    }

    var scale = d3.scaleLinear().domain([100, 300]).range([110, 330]);
    function resize() {
        var r = scale(this._.proj.scale());
        $.halo.attr('rx', r).attr('ry', r);
    }

    return {
        name: 'haloSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $halo: function $halo() {
            return $.halo;
        }
    };
});

var dotsSvg = (function (urlDots) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        important = _ref.important;

    /*eslint no-console: 0 */
    var _ = { dataDots: null, radiusPath: null };
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showDots = true;
        _.svg = __.svg;
    }

    function create() {
        var __ = this._;
        var klas = _.me.name;
        _.svg.selectAll('.dot.' + klas).remove();
        if (_.dataDots && __.options.showDots) {
            var circles = [];
            _.circles.forEach(function (d) {
                circles.push(d.circle);
            });
            $.dots = _.svg.append('g').attr('class', 'dot ' + klas).selectAll('path').data(circles).enter().append('path');
            if (_.dataDots.geometry) {
                var _g = _.dataDots.geometry || {};
                $.dots.style('stroke-width', _g.lineWidth || 0.2).style('fill', _g.fillStyle || 'rgba(100,0,0,.4)').style('stroke', _g.strokeStyle || 'rgba(119,119,119,.4)').attr('data-index', function (d, i) {
                    return i;
                });
            }
            refresh.call(this);
        }
    }

    function refresh() {
        var __ = this._;
        var coordinate = void 0,
            gdistance = void 0;
        if ($.dots && __.options.showDots) {
            var _g = _.dataDots.geometry || {};
            if (__.options.transparent || __.options.transparentDots) {
                __.proj.clipAngle(180);
                $.dots.style('fill', function (d, i) {
                    coordinate = d.coordinates[0][i];
                    gdistance = d3.geoDistance(coordinate, __.proj.invert(__.center));
                    return gdistance > 1.57 ? 'none' : _g.fillStyle || 'rgba(100,0,0,.4)';
                });
                $.dots.style('display', function () {
                    return __.drag && !important ? 'none' : 'inline';
                });
                $.dots.attr('d', __.path);
                __.proj.clipAngle(90);
            } else {
                $.dots.style('display', function (d, i) {
                    coordinate = d.coordinates[0][i];
                    gdistance = d3.geoDistance(coordinate, __.proj.invert(__.center));
                    return gdistance > 1.57 || __.drag && !important ? 'none' : 'inline';
                });
                $.dots.style('fill', _g.fillStyle || 'rgba(100,0,0,.4)');
                $.dots.attr('d', __.path);
            }
        }
    }

    function initData() {
        var geoCircle = d3.geoCircle();
        var _g = _.dataDots.geometry || {};
        var _r = _g.radius || 0.5;
        _.circles = _.dataDots.features.map(function (d) {
            var coordinates = d.geometry.coordinates;
            var properties = d.properties;
            var r = d.geometry.radius || _r;
            var circle = geoCircle.center(coordinates).radius(r)();
            return { properties: properties, coordinates: coordinates, circle: circle };
        });
    }

    return {
        name: 'dotsSvg',
        urls: urlDots && [urlDots],
        onReady: function onReady(err, dots) {
            _.me.data(dots);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        radiusPath: function radiusPath(path) {
            _.radiusPath = path;
        },
        data: function data(_data) {
            var _this = this;

            if (_data) {
                if (_.radiusPath) {
                    var p = _.radiusPath.split('.');
                    var x = _data.features.map(function (d) {
                        var v = d;
                        p.forEach(function (o) {
                            return v = v[o];
                        });
                        return v;
                    }).sort();
                    var scale = d3.scaleLinear().domain([x[0], x.pop()]).range([0.5, 2]);
                    _data.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) {
                            return v = v[o];
                        });
                        d.geometry.radius = scale(v);
                    });
                }
                _.dataDots = _data;
                initData();
                setTimeout(function () {
                    return refresh.call(_this);
                }, 1);
            } else {
                return _.dataDots;
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $dots: function $dots() {
            return $.dots;
        }
    };
});

var worldSvg = (function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = {
        q: null,
        svg: null,
        world: null,
        land: null,
        lakes: { type: 'FeatureCollection', features: [] },
        selected: { type: 'FeatureCollection', features: [] },
        countries: { type: 'FeatureCollection', features: [] }
    };
    var $ = {};

    function create() {
        var __ = this._;
        var klas = _.me.name;
        _.svg.selectAll('.world.' + klas).remove();
        if (__.options.showLand) {
            $.g = _.svg.append('g').attr('class', 'world ' + klas);
            if (_.world) {
                if (__.options.transparent || __.options.transparentLand) {
                    _.svgAddWorldBg.call(this);
                }
                if (__.options.showCountries || _.me.showCountries) {
                    _.svgAddCountries.call(this);
                } else {
                    _.svgAddWorld.call(this);
                }
                if (!__.drag && __.options.showLakes) {
                    _.svgAddLakes.call(this);
                }
            }
            refresh.call(this);
        }
    }

    function refresh() {
        var __ = this._;
        if (_.world) {
            if (__.options.transparent || __.options.transparentLand) {
                if (!$.worldBgPath) {
                    svgAddWorldBg();
                }
                __.proj.clipAngle(180);
                $.worldBgPath.attr('d', __.path);
                __.proj.clipAngle(90);
            } else if ($.worldBgPath) {
                $.worldBgG.remove();
                $.worldBgPath = null;
            }
            if (__.options.showLand) {
                if (__.options.showCountries) {
                    if (!$.countriesPath) {
                        $.worldG.remove();
                        $.worldPath = null;
                        svgAddCountries();
                    }
                    $.countriesPath.attr('d', __.path);
                } else {
                    if (!$.worldPath) {
                        $.countriesG.remove();
                        $.countriesPath = null;
                        svgAddWorld();
                    }
                    $.worldPath.attr('d', __.path);
                }
                if (__.options.showLakes) {
                    $.lakesPath.attr('d', __.path);
                }
            }
        }
    }

    function svgAddWorldBg() {
        $.worldBgG = $.g.append('g').attr('class', 'landbg');
        $.worldBgPath = $.worldBgG.append('path').datum(_.land).attr('fill', 'rgba(119,119,119,0.2)');
    }

    function svgAddWorld() {
        $.worldG = $.g.append('g').attr('class', 'land');
        $.worldPath = $.worldG.append('path').datum(_.land);
    }

    function svgAddCountries() {
        $.countriesG = $.g.append('g').attr('class', 'countries');
        $.countriesPath = $.countriesG.selectAll('path').data(_.countries.features).enter().append('path').attr('class', function (d) {
            return 'cid-' + d.properties.cid;
        }).attr('id', function (d) {
            return 'x' + d.id;
        });
    }

    function svgAddLakes() {
        $.lakesG = $.g.append('g').attr('class', 'lakes').append('path').datum(_.lakes);
        $.lakesPath = $.lakesG.append('path').datum(_.lakes);
    }

    function init() {
        _.svgAddCountries = svgAddCountries;
        _.svgAddWorldBg = svgAddWorldBg;
        _.svgAddLakes = svgAddLakes;
        _.svgAddWorld = svgAddWorld;
    }

    return {
        name: 'worldSvg',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            _.svg = this._.svg;
            var options = this._.options;

            options.showLand = true;
            options.showLakes = true;
            options.showCountries = true;
            options.transparentLand = false;
            init.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.land = topojson.feature(_data, _data.objects.land);
                _.countries.features = topojson.feature(_data, _data.objects.countries).features;
                if (_data.objects.ne_110m_lakes) _.lakes.features = topojson.feature(_data, _data.objects.ne_110m_lakes).features;
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.land = all.land;
                _.lakes = all.lakes;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    land = _.land,
                    lakes = _.lakes,
                    countries = _.countries;

                return { world: world, land: land, lakes: lakes, countries: countries };
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $world: function $world() {
            return $.worldPath;
        },
        $lakes: function $lakes() {
            return $.lakesPath;
        },
        $countries: function $countries() {
            return $.countriesPath;
        }
    };
});

var pingsSvg = (function () {
    /*eslint no-console: 0 */
    var _ = { svg: null, dataPings: null };
    var $ = {};

    function init() {
        var _this = this;

        var __ = this._;
        __.options.showPings = true;
        setInterval(function () {
            return animate.call(_this);
        }, 3000);
        _.svg = __.svg;
    }

    function create() {
        var klas = _.me.name;
        _.svg.selectAll('.pings.' + klas).remove();
        if (_.dataPings && this._.options.showPings) {
            var g = _.svg.append('g').attr('class', 'pings ' + klas);
            $.ping2 = g.selectAll('.ping-2').data(_.dataPings.features).enter().append('circle').attr('class', 'ping-2').attr('id', function (d, i) {
                return 'ping-' + i;
            });

            $.pings = g.selectAll('.ping-2');
            refresh.call(this);
            animate.call(this);
        }
    }

    function animate() {
        var nodes = $.ping2.nodes().filter(function (d) {
            return d.style.display == 'inline';
        });
        if (nodes.length > 0) {
            d3.select('#' + nodes[Math.floor(Math.random() * (nodes.length - 1))].id).attr('r', 2).attr('stroke', '#F00').attr('stroke-opacity', 1).attr('stroke-width', '10px').transition().duration(1000).attr('r', 30).attr('fill', 'none').attr('stroke-width', '0.1px');
        }
    }

    function refresh() {
        if (this._.drag == null) {
            $.pings.style('display', 'none');
        } else if (!this._.drag && $.pings && this._.options.showPings) {
            var proj = this._.proj;
            var center = this._.proj.invert(this._.center);
            $.pings.attr('cx', function (d) {
                return proj(d.geometry.coordinates)[0];
            }).attr('cy', function (d) {
                return proj(d.geometry.coordinates)[1];
            }).style('display', function (d) {
                return d3.geoDistance(d.geometry.coordinates, center) > 1.57 ? 'none' : 'inline';
            });
        }
    }

    return {
        name: 'pingsSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.dataPings = _data;
            } else {
                return _.dataPings;
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $pings: function $pings() {
            return $.pings;
        }
    };
});

var oceanSvg = (function () {
    var _ = {
        svg: null,
        q: null,
        scale: 0,
        oceanColor: ['rgba(221, 221, 255, 0.6)', 'rgba(153, 170, 187,0.8)'] };
    var $ = {};

    function init() {
        var __ = this._;
        this._.options.showOcean = true;
        Object.defineProperty(__.options, 'oceanColor', {
            get: function get() {
                return _.oceanColor;
            },
            set: function set(x) {
                _.oceanColor = x;
            }
        });
        _.svg = __.svg;
    }

    function create() {
        var klas = _.me.name;
        _.svg.selectAll('#ocean,.ocean.' + klas).remove();
        if (this._.options.showOcean) {
            var c = _.oceanColor;
            var ocean_fill = this.$slc.defs.append('radialGradient').attr('id', 'ocean').attr('cx', '75%').attr('cy', '25%');
            if (typeof c === 'string') {
                c = [c, c];
            }
            ocean_fill.append('stop').attr('offset', '100%').attr('stop-color', c[1]);
            $.ocean = _.svg.append('g').attr('class', 'ocean ' + klas).append('circle').attr('cx', this._.center[0]).attr('cy', this._.center[1]).attr('class', 'noclicks');
            resize.call(this);
        }
    }

    function resize() {
        if ($.ocean && this._.options.showOcean) {
            $.ocean.attr('r', this._.proj.scale() + _.scale);
        }
    }

    return {
        name: 'oceanSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        scale: function scale(sz) {
            if (sz) {
                _.scale = sz;
                resize.call(this);
            } else {
                return _.scale;
            }
        },
        recreate: function recreate() {
            create.call(this);
        },
        $ocean: function $ocean() {
            return $.ocean;
        }
    };
});

var sphereSvg = (function () {
    var _ = { svg: null, q: null, sphereColor: 0 };
    var $ = {};

    function create() {
        var klas = _.me.name;
        _.svg.selectAll('#glow,.sphere.' + klas).remove();
        if (this._.options.showSphere) {
            this.$slc.defs.nodes()[0].append('\n<filter id=\'glow\'>\n    <feColorMatrix type=\'matrix\'\n        values=\n        \'0 0 0 0   0\n         0 0 0 0.9 0\n         0 0 0 0.9 0\n         0 0 0 1   0\'/>\n    <feGaussianBlur stdDeviation=\'5.5\' result=\'coloredBlur\'/>\n    <feMerge>\n        <feMergeNode in=\'coloredBlur\'/>\n        <feMergeNode in=\'SourceGraphic\'/>\n    </feMerge>\n</filter>\n');
            $.sphere = _.svg.append('g').attr('class', 'sphere ' + klas).append('circle').attr('cx', this._.center[0]).attr('cy', this._.center[1]).attr('class', 'noclicks').attr('filter', 'url(#glow)');
            resize.call(this);
        }
    }

    function resize() {
        $.sphere.attr('r', this._.proj.scale());
    }

    return {
        name: 'sphereSvg',
        onInit: function onInit(me) {
            _.me = me;
            _.svg = this._.svg;
            var options = this._.options;

            options.showSphere = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $sphere: function $sphere() {
            return $.sphere;
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var centerSvg = (function () {
    /*eslint no-console: 0 */
    var _ = { focused: null, svgAddCountriesOld: null };

    function country(cnt, id) {
        id = id.replace('x', '');
        for (var i = 0, l = cnt.length; i < l; i++) {
            if (cnt[i].id == id) {
                return cnt[i];
            }
        }
    }

    function transition(p) {
        var __ = this._;
        var r = d3.interpolate(__.proj.rotate(), [-p[0], -p[1], 0]);
        var x = function x(t) {
            return __.rotate(r(t));
        }; // __.proj.rotate()
        d3.transition().duration(2500).tween('rotate', function () {
            return x;
        });
    }

    function create() {
        var _this = this;
        this.worldSvg.$countries().on('click', function () {
            if (_this._.options.enableCenter) {
                var id = this.id.replace('x', '');
                var focusedCountry = country(_this.worldSvg.countries(), id);
                transition.call(_this, d3.geoCentroid(focusedCountry));
                if (typeof _.focused === 'function') {
                    _.focused.call(_this);
                }
            }
        });
    }

    return {
        name: 'centerSvg',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.enableCenter = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        go: function go(id) {
            var c = this.worldSvg.countries();
            var focusedCountry = country(c, id),
                p = d3.geoCentroid(focusedCountry);
            transition.call(this, p);
        },
        focused: function focused(fn) {
            _.focused = fn;
        }
    };
});

var placesSvg = (function (urlPlaces) {
    var _ = { svg: null, q: null, places: null };
    var $ = {};

    function create() {
        var klas = _.me.name;
        _.svg.selectAll('.points.' + klas + ',.labels.' + klas).remove();
        if (_.places) {
            if (this._.options.showPlaces) {
                svgAddPlacePoints.call(this);
                svgAddPlaceLabels.call(this);
                refresh.call(this);
            }
        }
    }

    function svgAddPlacePoints() {
        var klas = _.me.name;
        $.placePoints = _.svg.append('g').attr('class', 'points ' + klas).selectAll('path').data(_.places.features).enter().append('path').attr('class', 'point');
    }

    function svgAddPlaceLabels() {
        var klas = _.me.name;
        $.placeLabels = _.svg.append('g').attr('class', 'labels ' + klas).selectAll('text').data(_.places.features).enter().append('text').attr('class', 'label').text(function (d) {
            return d.properties.name;
        });
    }

    function position_labels() {
        var _this = this;
        var centerPos = this._.proj.invert(this._.center);

        $.placeLabels.attr('text-anchor', function (d) {
            var x = _this._.proj(d.geometry.coordinates)[0];
            return x < _this._.center[0] - 20 ? 'end' : x < _this._.center[0] + 20 ? 'middle' : 'start';
        }).attr('transform', function (d) {
            var loc = _this._.proj(d.geometry.coordinates),
                x = loc[0],
                y = loc[1];
            var offset = x < _this._.center[0] ? -5 : 5;
            return 'translate(' + (x + offset) + ',' + (y - 2) + ')';
        }).style('display', function (d) {
            return d3.geoDistance(d.geometry.coordinates, centerPos) > 1.57 ? 'none' : 'inline';
        });
    }

    function refresh() {
        if ($.placePoints) {
            $.placePoints.attr('d', this._.path);
            position_labels.call(this);
        }
    }

    return {
        name: 'placesSvg',
        urls: urlPlaces && [urlPlaces],
        onReady: function onReady(err, places) {
            _.places = places;
        },
        onInit: function onInit(me) {
            _.me = me;
            _.svg = this._.svg;
            var options = this._.options;

            options.showPlaces = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.places = _data;
            } else {
                return _.places;
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $placePoints: function $placePoints() {
            return $.placePoints;
        },
        $placeLabels: function $placeLabels() {
            return $.placeLabels;
        }
    };
});

var flattenSvg = (function () {
    /*eslint no-console: 0 */
    var _ = {};
    window._flat = _;

    function init() {
        var g1 = this._.proj;
        var g2 = d3.geoEquirectangular().scale(this._.options.width / 6.3).translate(this._.center);
        _.g1 = g1;
        _.g2 = g2;
        _.scale = d3.scaleLinear().domain([47.3, _.g1.scale()]).range([0.0559, 1]);
        _.scaleG2 = d3.scaleLinear().domain([47.3, _.g1.scale()]).range([0, _.g2.scale()]);
    }

    function animation() {
        var _this = this;
        return _this._.svg.transition().duration(10500).tween('projection', function () {
            return function (_x) {
                animation.alpha(_x);
                _this._.refresh();
            };
        });
    }

    function interpolatedProjection(a, b) {
        _.px = d3.geoProjection(raw).scale(1);
        var alpha = void 0;

        function raw(lamda, pi) {
            var pa = a([lamda *= 180 / Math.PI, pi *= 180 / Math.PI]),
                pb = b([lamda, pi]);
            return [(1 - alpha) * pa[0] + alpha * pb[0], (alpha - 1) * pa[1] - alpha * pb[1]];
        }

        animation.alpha = function (_x) {
            if (!arguments.length) {
                return alpha;
            }
            alpha = +_x;
            var ca = a.center(),
                cb = b.center(),
                ta = a.translate(),
                tb = b.translate();
            _.px.center([(1 - alpha) * ca[0] + alpha * cb[0], (1 - alpha) * ca[1] + alpha * cb[1]]);
            _.px.translate([(1 - alpha) * ta[0] + alpha * tb[0], (1 - alpha) * ta[1] + alpha * tb[1]]);
            return _.px;
        };
        animation.alpha(0);
        return _.px;
    }

    //Rotate to default before animation
    function defaultRotate() {
        var __ = this._;
        return d3.transition().duration(1500).tween('rotate', function () {
            __.rotate(__.proj.rotate());
            var r = d3.interpolate(__.proj.rotate(), [0, 0, 0]);
            return function (t) {
                __.rotate(r(t));
            };
        });
    }

    return {
        name: 'flattenSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onResize: function onResize() {
            if (this._.options.map) {
                var g1 = _.g1.scale();
                var g2 = _.scale(g1);
                _.px.scale(g2);
                _.path.attr('d', this._.path);
            }
        },
        toMap: function toMap() {
            var _this2 = this;

            defaultRotate.call(this).on('end', function () {
                _.g2.scale(_.scaleG2(_.g1.scale()));
                var proj = interpolatedProjection(_.g1, _.g2);
                _this2._.path = d3.geoPath().projection(proj);
                animation.call(_this2).on('end', function () {
                    _.path = _this2._.svg.selectAll('path');
                    _this2._.options.enableCenter = false;
                    _this2._.options.map = true;
                });
            });
        },
        toGlobe: function toGlobe() {
            var _this3 = this;

            this._.rotate([0, 0, 0]);
            // const scale = _.px.scale();
            _.g2.scale(_.scaleG2(_.g1.scale()));
            var proj = interpolatedProjection(_.g2, _.g1);
            // proj.scale(scale);
            this._.path = d3.geoPath().projection(proj);
            animation.call(this).on('end', function () {
                _this3._.path = d3.geoPath().projection(_.g1);
                _this3._.options.enableCenter = true;
                _this3._.options.map = false;
                _this3._.refresh();
            });
        }
    };
});

// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
var fauxGlobeSvg = (function () {
    /*eslint no-console: 0 */
    var _ = { svg: null, q: null };
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showGlobeShading = true;
        __.options.showGlobeHilight = true;
        _.svg = __.svg;
    }

    function create() {
        svgAddGlobeShading.call(this);
        svgAddGlobeHilight.call(this);
    }

    function svgAddGlobeShading() {
        var __ = this._;
        var klas = _.me.name;
        _.svg.selectAll('#shading,.shading.' + klas).remove();
        if (__.options.showGlobeShading) {
            var globe_shading = this.$slc.defs.append('radialGradient').attr('id', 'shading').attr('cx', '50%').attr('cy', '40%');
            globe_shading.append('stop').attr('offset', '50%').attr('stop-color', '#9ab').attr('stop-opacity', '0');
            globe_shading.append('stop').attr('offset', '100%').attr('stop-color', '#3e6184').attr('stop-opacity', '0.3');
            $.globeShading = _.svg.append('g').attr('class', 'shading ' + klas).append('circle').attr('cx', __.center[0]).attr('cy', __.center[1]).attr('r', __.proj.scale()).attr('class', 'noclicks').style('fill', 'url(#shading)');
        }
    }

    function svgAddGlobeHilight() {
        var __ = this._;
        var klas = _.me.name;
        _.svg.selectAll('#hilight,.hilight.' + klas).remove();
        if (__.options.showGlobeHilight) {
            var globe_highlight = this.$slc.defs.append('radialGradient').attr('id', 'hilight').attr('cx', '75%').attr('cy', '25%');
            globe_highlight.append('stop').attr('offset', '5%').attr('stop-color', '#ffd').attr('stop-opacity', '0.6');
            globe_highlight.append('stop').attr('offset', '100%').attr('stop-color', '#ba9').attr('stop-opacity', '0.2');
            $.globeHilight = _.svg.append('g').attr('class', 'hilight ' + klas).append('circle').attr('cx', __.center[0]).attr('cy', __.center[1]).attr('r', __.proj.scale()).attr('class', 'noclicks').style('fill', 'url(#hilight)');
        }
    }

    function resize() {
        var __ = this._;
        var options = __.options;

        var scale = __.proj.scale();
        if ($.globeShading && options.showGlobeShading) {
            $.globeShading.attr('r', scale);
        }
        if ($.globeHilight && options.showGlobeHilight) {
            $.globeHilight.attr('r', scale);
        }
    }

    return {
        name: 'fauxGlobeSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $globeShading: function $globeShading() {
            return $.globeShading;
        },
        $globeHilight: function $globeHilight() {
            return $.globeHilight;
        }
    };
});

var graticuleSvg = (function () {
    var _ = { svg: null, q: null, graticule: d3.geoGraticule() };
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showGraticule = true;
        __.options.transparentGraticule = false;
        _.svg = __.svg;
    }

    function create() {
        var klas = _.me.name;
        _.svg.selectAll('.graticule.' + klas).remove();
        if (this._.options.showGraticule) {
            $.graticule = _.svg.append('g').attr('class', 'graticule ' + klas).append('path').datum(_.graticule).attr('class', 'noclicks');
            refresh.call(this);
        }
    }

    function refresh() {
        var __ = this._;
        if ($.graticule && __.options.showGraticule) {
            if (__.options.transparent || __.options.transparentGraticule) {
                __.proj.clipAngle(180);
                $.graticule.attr('d', this._.path);
                __.proj.clipAngle(90);
            } else {
                $.graticule.attr('d', this._.path);
            }
        }
    }

    return {
        name: 'graticuleSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $graticule: function $graticule() {
            return $.graticule;
        }
    };
});

// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
var dropShadowSvg = (function () {
    /*eslint no-console: 0 */
    var _ = { svg: null, q: null };
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showDropShadow = true;
        _.svg = __.svg;
    }

    function create() {
        var __ = this._;
        var klas = _.me.name;
        _.svg.selectAll('#drop_shadow,.drop_shadow.' + klas).remove();
        if (__.options.showDropShadow) {
            var drop_shadow = this.$slc.defs.append('radialGradient').attr('id', 'drop_shadow').attr('cx', '50%').attr('cy', '50%');
            drop_shadow.append('stop').attr('offset', '20%').attr('stop-color', '#000').attr('stop-opacity', '.5');
            drop_shadow.append('stop').attr('offset', '100%').attr('stop-color', '#000').attr('stop-opacity', '0');
            $.dropShadow = _.svg.append('g').attr('class', 'drop_shadow ' + klas).append('ellipse').attr('cx', __.center[0]).attr('class', 'noclicks').style('fill', 'url(#drop_shadow)');
            resize.call(this);
        }
    }

    function resize() {
        var scale = this._.proj.scale();
        $.dropShadow.attr('cy', scale + this._.center[1]).attr('rx', scale * 0.90).attr('ry', scale * 0.25);
    }

    return {
        name: 'dropShadowSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            if ($.dropShadow && this._.options.showDropShadow) {
                resize.call(this);
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $dropShadow: function $dropShadow() {
            return $.dropShadow;
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var dotTooltipSvg = (function () {
    /*eslint no-console: 0 */
    var _ = { mouseXY: [0, 0], visible: false };
    var dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    function show(data, tooltip) {
        var props = data.properties;
        var title = Object.keys(props).map(function (k) {
            return k + ': ' + props[k];
        }).join('<br/>');
        return tooltip.html(title);
    }

    function create() {
        var _this = this;
        this.dotsSvg.$dots().on('mouseover', function () {
            if (_this._.options.showBarTooltip) {
                _.visible = true;
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                var i = +this.dataset.index;
                var data = _this.dotsSvg.data().features[i];
                (_.me.show || show)(data, dotTooltip).style('display', 'block').style('opacity', 1);
                refresh();
            }
        }).on('mouseout', function () {
            _.visible = false;
            dotTooltip.style('opacity', 0).style('display', 'none');
        }).on('mousemove', function () {
            if (_this._.options.showBarTooltip) {
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                refresh();
            }
        });
    }

    function refresh() {
        dotTooltip.style('left', _.mouseXY[0] + 7 + 'px').style('top', _.mouseXY[1] - 15 + 'px');
    }

    function resize() {
        create.call(this);
        dotTooltip.style('opacity', 0).style('display', 'none');
    }

    return {
        name: 'dotTooltipSvg',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showBarTooltip = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        visible: function visible() {
            return _.visible;
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var barTooltipSvg = (function () {
    /*eslint no-console: 0 */
    var _ = { mouseXY: [0, 0], visible: false };
    var barTooltip = d3.select('body').append('div').attr('class', 'ej-bar-tooltip');

    function show(data, tooltip) {
        var props = data.properties;
        var title = Object.keys(props).map(function (k) {
            return k + ': ' + props[k];
        }).join('<br/>');
        return tooltip.html(title);
    }

    function create() {
        var _this = this;
        this.barSvg.$bar().on('mouseover', function () {
            if (_this._.options.showBarTooltip) {
                _.visible = true;
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                var i = +this.dataset.index;
                var data = _this.barSvg.data().features[i];
                (_.me.show || show)(data, barTooltip).style('display', 'block').style('opacity', 1);
                refresh();
            }
        }).on('mouseout', function () {
            _.visible = false;
            barTooltip.style('opacity', 0).style('display', 'none');
        }).on('mousemove', function () {
            if (_this._.options.showBarTooltip) {
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                refresh();
            }
        });
    }

    function refresh() {
        barTooltip.style('left', _.mouseXY[0] + 7 + 'px').style('top', _.mouseXY[1] - 15 + 'px');
    }

    function resize() {
        create.call(this);
        barTooltip.style('opacity', 0).style('display', 'none');
    }

    return {
        name: 'barTooltipSvg',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showBarTooltip = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        visible: function visible() {
            return _.visible;
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var countryTooltipSvg = (function (countryNameUrl) {
    /*eslint no-console: 0 */
    var _ = { show: false };
    var countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

    function countryName(d) {
        var cname = '';
        if (_.countryNames) {
            cname = _.countryNames.find(function (x) {
                return x.id == d.id;
            });
        }
        return cname;
    }

    function show(data, tooltip) {
        var title = Object.keys(data).map(function (k) {
            return k + ': ' + data[k];
        }).join('<br/>');
        return tooltip.html(title);
    }

    function create() {
        var _this = this;
        this.worldSvg.$countries().on('mouseover', function (d) {
            if (_this._.options.showCountryTooltip) {
                _.show = true;
                var country = countryName(d);
                refresh();
                (_.me.show || show)(country, countryTooltip).style('display', 'block').style('opacity', 1);
            }
        }).on('mouseout', function () {
            _.show = false;
            countryTooltip.style('opacity', 0).style('display', 'none');
        }).on('mousemove', function () {
            _.mouse = d3.mouse(this);
            if (_this._.options.showCountryTooltip) {
                refresh();
            }
        });
    }

    function refresh(mouse) {
        if (!mouse) {
            mouse = [d3.event.pageX, d3.event.pageY];
        }
        return countryTooltip.style('left', mouse[0] + 7 + 'px').style('top', mouse[1] - 15 + 'px');
    }

    return {
        name: 'countryTooltipSvg',
        urls: countryNameUrl && [countryNameUrl],
        onReady: function onReady(err, countryNames) {
            _.countryNames = countryNames;
        },
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showCountryTooltip = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            if (this._.drag && _.show) {
                refresh.call(this, _.mouse);
            }
        },
        data: function data(_data) {
            if (_data) {
                _.countryNames = _data;
            } else {
                return _.countryNames;
            }
        }
    };
});

var pinCanvas = (function (urlJson, urlImage) {
    var wh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [15, 25];

    /*eslint no-console: 0 */
    var _ = { dataPin: null, image: null, w: null, h: null };
    d3.select('body').append('img').attr('src', urlImage).attr('id', 'pin').attr('width', '0').attr('height', '0');
    _.image = document.getElementById('pin');

    function init(wh) {
        this._.options.showPin = true;
        var sc = this._.proj.scale();
        _.w = d3.scaleLinear().domain([0, sc]).range([0, wh[0]]);
        _.h = d3.scaleLinear().domain([0, sc]).range([0, wh[1]]);
        resize.call(this);
    }

    function create() {
        if (this._.options.showPin) {
            var __ = this._;
            var center = __.proj.invert(__.center);
            this.canvasPlugin.render(function (context) {
                if (_.dataPin) {
                    _.dataPin.features.forEach(function (d) {
                        var coordinates = d.geometry.coordinates;
                        if (d3.geoDistance(coordinates, center) <= 1.57) {
                            var a = __.path.centroid(d);
                            context.drawImage(_.image, a[0] - _.pX, a[1] - _.pY, _.wh[0], _.wh[1]);
                        }
                    });
                }
            }, _.drawTo);
        }
    }

    function resize() {
        var __ = this._;
        var sc = __.proj.scale();
        var wh = [_.w(sc), _.h(sc)];
        _.wh = wh;
        _.pX = wh[0] / 2;
        _.pY = wh[1];
    }

    return {
        name: 'pinCanvas',
        urls: urlJson && [urlJson],
        onReady: function onReady(err, json) {
            _.me.data(json);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this, wh);
        },
        onCreate: function onCreate() {
            var _this = this;

            setTimeout(function () {
                return create.call(_this);
            }, 1);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onRefresh: function onRefresh() {
            create.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.dataPin = _data;
            } else {
                return _.dataPin;
            }
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        image: function image() {
            return _.image;
        },
        size: function size(wh) {
            if (wh) {
                _.wh = wh;
                init.call(this, wh);
            } else {
                return _.wh;
            }
        }
    };
});

var dotsCanvas = (function (urlJson) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        important = _ref.important;

    /*eslint no-console: 0 */
    var _ = { dataDots: null, dots: [], radiusPath: null };

    function create() {
        var __ = this._;
        if (!(__.drag && !important) && _.dataDots && this._.options.showDots) {
            var proj = this._.proj;
            var _g = _.dataDots.geometry || {};
            var center = proj.invert(this._.center);
            var dots1 = [];
            var dots2 = [];
            _.dots.forEach(function (d) {
                if (d3.geoDistance(d.coordinates, center) > 1.57) {
                    dots1.push(d.circle);
                } else {
                    dots2.push(d.circle);
                }
            });
            if (__.options.transparent || __.options.transparentDots) {
                this.canvasPlugin.flipRender(function (context, path) {
                    context.beginPath();
                    path({ type: 'GeometryCollection', geometries: dots1 });
                    context.lineWidth = 0.2;
                    context.strokeStyle = 'rgba(119,119,119,.4)';
                    context.stroke();
                }, _.drawTo);
            }
            this.canvasPlugin.render(function (context, path) {
                context.beginPath();
                path({ type: 'GeometryCollection', geometries: dots2 });
                context.lineWidth = _g.lineWidth || 0.2;
                context.fillStyle = _g.fillStyle || 'rgba(100,0,0,.4)';
                context.strokeStyle = _g.strokeStyle || 'rgba(100,0,0,.6)';
                context.fill();
                context.stroke();
            }, _.drawTo);
        }
    }

    function initData() {
        var geoCircle = d3.geoCircle();
        var _g = _.dataDots.geometry || {};
        var _r = _g.radius || 0.5;
        _.dots = _.dataDots.features.map(function (d) {
            var coordinates = d.geometry.coordinates;
            var properties = d.properties;
            var r = d.geometry.radius || _r;
            var circle = geoCircle.center(coordinates).radius(r)();
            return { properties: properties, coordinates: coordinates, circle: circle };
        });
    }

    return {
        name: 'dotsCanvas',
        urls: urlJson && [urlJson],
        onReady: function onReady(err, json) {
            _.me.data(json);
        },
        onInit: function onInit(me) {
            _.me = me;
            this._.options.transparentDots = false;
            this._.options.showDots = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            // execue if important or start/end of drag
            if (important || this._.drag !== true) {
                create.call(this);
            }
        },
        radiusPath: function radiusPath(path) {
            _.radiusPath = path;
        },
        data: function data(_data) {
            var _this = this;

            if (_data) {
                if (_.radiusPath) {
                    var p = _.radiusPath.split('.');
                    var x = _data.features.map(function (d) {
                        var v = d;
                        p.forEach(function (o) {
                            return v = v[o];
                        });
                        return v;
                    }).sort();
                    var scale = d3.scaleLinear().domain([x[0], x.pop()]).range([0.5, 2]);
                    _data.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) {
                            return v = v[o];
                        });
                        d.geometry.radius = scale(v);
                    });
                }
                _.dataDots = _data;
                initData();
                setTimeout(function () {
                    return create.call(_this);
                }, 1);
            } else {
                return _.dataDots;
            }
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        dots: function dots() {
            return _.dots;
        }
    };
});

// John J Czaplewski’s Block http://bl.ocks.org/jczaplew/6798471
var worldCanvas = (function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = {
        style: {},
        options: {},
        drawTo: null,
        world: null,
        land: null,
        lakes: { type: 'FeatureCollection', features: [] },
        countries: { type: 'FeatureCollection', features: [] },
        selected: { type: 'FeatureCollection', features: [], multiColor: false }
    };

    function create() {
        var _this = this;

        var __ = this._;
        if (_.world) {
            if (__.options.transparent || __.options.transparentLand) {
                this.canvasPlugin.flipRender(function (context, path) {
                    context.beginPath();
                    path(_.land);
                    context.fillStyle = _.style.backLand || 'rgba(119,119,119,0.2)';
                    context.fill();
                }, _.drawTo, _.options);
            }
            if (__.options.showLand) {
                if (__.options.showCountries || _.me.showCountries) {
                    canvasAddCountries.call(this, __.options.showBorder);
                } else {
                    canvasAddWorld.call(this);
                }
                if (!__.drag && __.options.showLakes) {
                    canvasAddLakes.call(this);
                }
            } else if (__.options.showBorder) {
                canvasAddCountries.call(this, true);
            }
            if (this.hoverCanvas && __.options.showSelectedCountry) {
                if (_.selected.features.length > 0) {
                    if (!_.selected.multiColor) {
                        this.canvasPlugin.render(function (context, path) {
                            context.beginPath();
                            path(_.selected);
                            context.fillStyle = _.style.selected || 'rgba(87, 255, 99, 0.5)';
                            context.fill();
                        }, _.drawTo, _.options);
                    } else {
                        var l1 = _.selected.features.length;
                        var l2 = l1 - 1;

                        var _loop = function _loop() {
                            var scountry = _.selected.features[l2 - l1];
                            _this.canvasPlugin.render(function (context, path) {
                                context.beginPath();
                                path(scountry);
                                context.fillStyle = scountry.color;
                                context.fill();
                            }, _.drawTo, _.options);
                        };

                        while (l1--) {
                            _loop();
                        }
                    }
                }

                var _hoverCanvas$states = this.hoverCanvas.states(),
                    country = _hoverCanvas$states.country;

                if (country && !_.selected.features.find(function (obj) {
                    return obj.id === country.id;
                })) {
                    this.canvasPlugin.render(function (context, path) {
                        context.beginPath();
                        path(country);
                        context.fillStyle = _.style.hover || 'rgba(117, 0, 0, 0.5)';
                        context.fill();
                    }, _.drawTo, _.options);
                }
            }
        }
    }

    function canvasAddWorld() {
        this.canvasPlugin.render(function (context, path) {
            context.beginPath();
            path(_.land);
            context.fillStyle = _.style.land || 'rgba(2, 20, 37,0.8)';
            context.fill();
        }, _.drawTo, _.options);
    }

    function canvasAddCountries() {
        var border = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        this.canvasPlugin.render(function (context, path) {
            context.beginPath();
            path(_.countries);
            if (!border) {
                context.fillStyle = _.style.countries || 'rgba(2, 20, 37,0.8)';
                context.fill();
            }
            context.lineWidth = 0.1;
            context.strokeStyle = _.style.border || 'rgb(239, 237, 234)';
            context.stroke();
        }, _.drawTo, _.options);
    }

    function canvasAddLakes() {
        this.canvasPlugin.render(function (context, path) {
            context.beginPath();
            path(_.lakes);
            context.fillStyle = _.style.lakes || 'rgba(80, 87, 97, 0.5)';
            context.fill();
        }, _.drawTo, _.options);
    }

    return {
        name: 'worldCanvas',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            var options = this._.options;
            options.showLand = true;
            options.showLakes = true;
            options.showBorder = false;
            options.showCountries = true;
            options.transparentLand = false;
        },
        onCreate: function onCreate() {
            var _this2 = this;

            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
            if (this.hoverCanvas) {
                var hover = {};
                hover[_.me.name] = function () {
                    if (!_this2._.options.spin) {
                        _this2._.refresh();
                    }
                };
                this.hoverCanvas.onCountry(hover);
            }
        },
        onRefresh: function onRefresh() {
            create.call(this);
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
        selectedCountries: function selectedCountries(arr) {
            var multiColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (arr) {
                _.selected.features = arr;
                _.selected = { type: 'FeatureCollection', features: arr, multiColor: multiColor };
            } else {
                return _.selected.features;
            }
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.land = topojson.feature(_data, _data.objects.land);
                _.countries.features = topojson.feature(_data, _data.objects.countries).features;
                if (_data.objects.ne_110m_lakes) _.lakes.features = topojson.feature(_data, _data.objects.ne_110m_lakes).features;
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.land = all.land;
                _.lakes = all.lakes;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    land = _.land,
                    lakes = _.lakes,
                    countries = _.countries;

                return { world: world, land: land, lakes: lakes, countries: countries };
            }
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        options: function options(_options) {
            _.options = _options;
        }
    };
});

var pingsCanvas = (function () {
    var _ = { dataPings: null, pings: [] };

    var start = 0;
    function interval(timestamp) {
        if (timestamp - start > 40) {
            start = timestamp;
            if (!this._.drag && this._.options.showPings) {
                var center = void 0;
                var proj = this._.proj;
                if (_.pings.length <= 7) {
                    center = this._.proj.invert(this._.center);
                    var visible = _.dataPings.features.filter(function (d) {
                        return d3.geoDistance(d.geometry.coordinates, center) <= 1.57;
                    });
                    var d = visible[Math.floor(Math.random() * (visible.length - 1))];
                    _.pings.push({ r: 2.5, l: d.geometry.coordinates });
                }
                var p = _.pings[0];
                if (d3.geoDistance(p.l, this._.proj.invert(this._.center)) > 1.57) {
                    _.pings.shift();
                } else {
                    if (!this._.options.spin) {
                        this._.refresh(/anvas/);
                    }
                    this.canvasPlugin.render(function (context) {
                        context.beginPath();
                        context.fillStyle = '#F80';
                        context.arc(proj(p.l)[0], proj(p.l)[1], p.r, 0, 2 * Math.PI);
                        context.fill();
                        context.closePath();
                        p.r = p.r + 0.2;
                        if (p.r > 5) {
                            _.pings.shift();
                        } else if (_.pings.length > 1) {
                            var _d = _.pings.shift();
                            _.pings.push(_d);
                        }
                    }, _.drawTo);
                }
            }
        }
    }

    return {
        name: 'pingsCanvas',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showPings = true;
        },
        onInterval: function onInterval(t) {
            interval.call(this, t);
        },
        data: function data(_data) {
            if (_data) {
                _.dataPings = _data;
            } else {
                return _.dataPings;
            }
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var centerCanvas = (function () {
    /*eslint no-console: 0 */
    var _ = { focused: null };

    function country(cnt, id) {
        id = ('' + id).replace('x', '');
        for (var i = 0, l = cnt.length; i < l; i++) {
            if (cnt[i].id == id) {
                return cnt[i];
            }
        }
    }

    function transition(p) {
        var __ = this._;
        var r = d3.interpolate(__.proj.rotate(), [-p[0], -p[1], 0]);
        var x = function x(t) {
            return __.rotate(r(t));
        }; // __.proj.rotate()
        d3.transition().duration(2500).tween('rotate', function () {
            return x;
        });
    }

    function create() {
        var _this = this;
        if (this.clickCanvas) {
            this.clickCanvas.onCountry({
                centerCanvas: function centerCanvas(event, country) {
                    if (country) {
                        transition.call(_this, d3.geoCentroid(country));
                        if (typeof _.focused === 'function') {
                            _.focused.call(_this, event, country);
                            if (_this.threejsPlugin) {
                                _this.threejsPlugin.rotate();
                            }
                        }
                    }
                }
            });
        }
    }

    return {
        name: 'centerCanvas',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.enableCenter = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        go: function go(id) {
            var c = this.worldCanvas.countries();
            var focusedCountry = country(c, id),
                p = d3.geoCentroid(focusedCountry);
            if (this.inertiaPlugin) {
                this.inertiaPlugin.stopDrag();
            }
            transition.call(this, p);
        },
        focused: function focused(fn) {
            _.focused = fn;
        }
    };
});

var dotSelectCanvas = (function () {
    /*eslint no-console: 0 */
    var _ = { dataDots: null, dots: null, radiusPath: null,
        onHover: {},
        onHoverVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: []
    };

    function detect(pos) {
        var dot = null;
        if (_.dots) {
            var _hoverCanvas$states = this.hoverCanvas.states(),
                mouse = _hoverCanvas$states.mouse;

            _.dots.forEach(function (d) {
                if (mouse && !dot) {
                    var geoDistance = d3.geoDistance(d.coordinates, pos);
                    if (geoDistance <= 0.02) {
                        dot = d;
                    }
                }
            });
        }
        return dot;
    }

    function initCircleHandler() {
        var _this = this;

        if (this.hoverCanvas) {
            var hoverHandler = function hoverHandler(event, pos) {
                var dot = detect.call(_this, pos);
                _.onHoverVals.forEach(function (v) {
                    v.call(_this, event, dot);
                });
                return dot;
            };
            // always receive hover event
            hoverHandler.tooltips = true;
            this.hoverCanvas.onCircle({
                dotsCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            var clickHandler = function clickHandler(event, pos) {
                var dot = detect.call(_this, pos);
                _.onClickVals.forEach(function (v) {
                    v.call(_this, event, dot);
                });
                return dot;
            };
            this.clickCanvas.onCircle({
                dotsCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            var dblClickHandler = function dblClickHandler(event, pos) {
                var dot = detect(event, pos);
                _.onDblClickVals.forEach(function (v) {
                    v.call(_this, event, dot);
                });
                return dot;
            };
            this.dblClickCanvas.onCircle({
                dotsCanvas: dblClickHandler
            });
        }
    }

    return {
        name: 'dotSelectCanvas',
        onInit: function onInit(me) {
            _.me = me;
            initCircleHandler.call(this);
        },
        onCreate: function onCreate() {
            if (this.dotsCanvas && !_.dots) {
                _.me.dots(this.dotsCanvas.dots());
            }
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) {
                return _.onHover[k];
            });
        },
        onClick: function onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(function (k) {
                return _.onClick[k];
            });
        },
        onDblClick: function onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(function (k) {
                return _.onDblClick[k];
            });
        },
        dots: function dots(_dots) {
            _.dots = _dots;
        }
    };
});

var graticuleCanvas = (function () {
    var datumGraticule = d3.geoGraticule()();
    var _ = { style: {}, drawTo: null };

    function init() {
        var __ = this._;
        __.options.showGraticule = true;
        __.options.transparentGraticule = false;
    }

    function create() {
        var __ = this._;
        if (__.options.showGraticule) {
            if (__.options.transparent || __.options.transparentGraticule) {
                __.proj.clipAngle(180);
            }
            this.canvasPlugin.render(function (context, path) {
                context.beginPath();
                path(datumGraticule);
                context.lineWidth = _.style.lineWidth || 0.4;
                context.strokeStyle = _.style.line || 'rgba(119,119,119,0.6)';
                context.stroke();
            }, _.drawTo);
            if (__.options.transparent || __.options.transparentGraticule) {
                __.proj.clipAngle(90);
            }
        }
    }

    return {
        name: 'graticuleCanvas',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            create.call(this);
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        }
    };
});

var dotTooltipCanvas = (function () {
    /*eslint no-console: 0 */
    var _ = { hidden: null };
    var dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    function show(data, tooltip) {
        var props = data.properties;
        var title = Object.keys(props).map(function (k) {
            return k + ': ' + props[k];
        }).join('<br/>');
        return tooltip.html(title);
    }

    function showTooltip(event, data) {
        var mouse = [event.clientX, event.clientY];
        (_.me.show || show)(data, dotTooltip).style('display', 'block').style('opacity', 1).style('left', mouse[0] + 7 + 'px').style('top', mouse[1] - 15 + 'px');
        _.oldData = data;
        _.hidden = false;
    }

    function hideTooltip() {
        if (!_.hidden) {
            _.hidden = true;
            dotTooltip.style('opacity', 0).style('display', 'none');
        }
    }

    function init() {
        var _this = this;

        var hoverHandler = function hoverHandler(event, data) {
            if (data && _this._.drag !== null) {
                showTooltip(event, data);
            } else {
                hideTooltip();
            }
        };
        this.dotSelectCanvas.onHover({
            dotTooltipCanvas: hoverHandler
        });
    }

    return {
        name: 'dotTooltipCanvas',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var countrySelectCanvas = (function () {
    /*eslint no-console: 0 */
    var _ = { countries: null,
        onHover: {},
        onHoverVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: []
    };

    function init() {
        var _this = this;

        if (this.hoverCanvas) {
            var hoverHandler = function hoverHandler(event, country) {
                _.onHoverVals.forEach(function (v) {
                    v.call(_this, event, country);
                });
                return country;
            };
            this.hoverCanvas.onCountry({
                countrySelectCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            var clickHandler = function clickHandler(event, country) {
                _.onClickVals.forEach(function (v) {
                    v.call(_this, event, country);
                });
                return country;
            };
            this.clickCanvas.onCountry({
                countrySelectCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            var dblClickHandler = function dblClickHandler(event, country) {
                _.onDblClickVals.forEach(function (v) {
                    v.call(_this, event, country);
                });
                return country;
            };
            this.dblClickCanvas.onCountry({
                countrySelectCanvas: dblClickHandler
            });
        }
    }

    function create() {
        if (this.worldCanvas && !_.countries) {
            var world = this.worldCanvas.data();
            if (world) {
                _.world = world;
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
    }

    return {
        name: 'countrySelectCanvas',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) {
                return _.onHover[k];
            });
        },
        onClick: function onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(function (k) {
                return _.onClick[k];
            });
        },
        onDblClick: function onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(function (k) {
                return _.onDblClick[k];
            });
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.countries = topojson.feature(_data, _data.objects.countries);
            } else {
                return _.world;
            }
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var countryTooltipCanvas = (function (countryNameUrl) {
    /*eslint no-console: 0 */
    var _ = { hidden: null };
    var countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

    function countryName(d) {
        var cname = '';
        if (_.countryNames) {
            cname = _.countryNames.find(function (x) {
                return x.id == d.id;
            });
        }
        return cname;
    }

    function refresh(mouse) {
        return countryTooltip.style('left', mouse[0] + 7 + 'px').style('top', mouse[1] - 15 + 'px');
    }

    function show(data, tooltip) {
        var title = Object.keys(data).map(function (k) {
            return k + ': ' + data[k];
        }).join('<br/>');
        return tooltip.html(title);
    }

    function showTooltip(event, country) {
        refresh([event.clientX, event.clientY]);
        (_.me.show || show)(country, countryTooltip).style('display', 'block').style('opacity', 1);
        _.hidden = false;
    }

    function hideTooltip() {
        if (!_.hidden) {
            _.hidden = true;
            countryTooltip.style('opacity', 0).style('display', 'none');
        }
    }

    function init() {
        var _this = this;

        var hoverHandler = function hoverHandler(event, data) {
            // fn with  current context
            _.mouse = [event.clientX, event.clientY];
            if (_this._.drag !== null && data && _this._.options.showCountryTooltip) {
                var country = countryName(data);
                if (country && !(_this.barTooltipSvg && _this.barTooltipSvg.visible())) {
                    showTooltip(event, country);
                } else {
                    hideTooltip();
                }
            } else {
                hideTooltip();
            }
        };
        // always receive hover event
        hoverHandler.tooltips = true;
        this.hoverCanvas.onCountry({
            countryTooltipCanvas: hoverHandler
        });
        this._.options.showCountryTooltip = true;
    }

    return {
        name: 'countryTooltipCanvas',
        urls: countryNameUrl && [countryNameUrl],
        onReady: function onReady(err, countryNames) {
            _.countryNames = countryNames;
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onRefresh: function onRefresh() {
            if (this._.drag) {
                refresh.call(this, _.mouse);
            }
        },
        data: function data(_data) {
            if (_data) {
                _.countryNames = _data;
            } else {
                return _.countryNames;
            }
        }
    };
});

// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
var barThreejs = (function (jsonUrl) {
    var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null,
        data: null
    };
    var material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors,
        morphTargets: false,
        color: 0xaaffff
    });

    function createGeometry(w) {
        var geometry = new THREE.BoxGeometry(2, 2, w);
        for (var i = 0; i < geometry.faces.length; i += 2) {
            var hex = Math.random() * 0xffffff;
            geometry.faces[i].color.setHex(hex);
            geometry.faces[i + 1].color.setHex(hex);
        }
        return geometry;
    }

    function meshCoordinate(mesh, sc) {
        var phi = (90 - mesh.coordinates[1]) * 0.017453292519943295; //Math.PI / 180.0;
        var the = (360 - mesh.coordinates[0]) * 0.017453292519943295; //Math.PI / 180.0;

        mesh.position.x = sc * Math.sin(phi) * Math.cos(the);
        mesh.position.y = sc * Math.cos(phi);
        mesh.position.z = sc * Math.sin(phi) * Math.sin(the);
        mesh.lookAt({ x: 0, y: 0, z: 0 });
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var group = new THREE.Group();
            var SCALE = this._.proj.scale();
            _.max = d3.max(_.data.features, function (d) {
                return parseInt(d.geometry.value);
            });
            _.scale = d3.scaleLinear().domain([0, _.max]).range([2, 70]);
            _.data.features.forEach(function (data) {
                var v = data.geometry.value;
                var h = v ? _.scale(v) : height;
                var geometry = createGeometry(h);
                var mesh = new THREE.Mesh(geometry, material);
                mesh.coordinates = data.geometry.coordinates;
                meshCoordinate(mesh, h / 2 + SCALE);
                mesh.ov = h;
                group.add(mesh);
            });
            _.sphereObject = group;
            _.sphereObject.name = _.me.name;
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'barThreejs',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(_data) {
            if (_data) {
                if (_.valuePath) {
                    var p = _.valuePath.split('.');
                    _data.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) {
                            return v = v[o];
                        });
                        d.geometry.value = v;
                    });
                }
                _.data = _data;
            } else {
                return _.data;
            }
        },
        scale: function scale(sc) {
            _.sphereObject.children.forEach(function (mesh) {
                mesh.scale.x = sc;
                mesh.scale.y = sc;
                mesh.scale.z = sc;
            });
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
        color: function color(c) {
            material.color.set(c);
            material.needsUpdate = true;
            this.threejsPlugin.renderThree();
        }
    };
});

// https://github.com/pyalot/webgl-heatmap
// https://github.com/pyalot/webgl-heatmap/blob/master/example.html
var hmapThreejs = (function (hmapUrl) {
    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null,
        material: new THREE.MeshBasicMaterial({ transparent: true })
    };
    var $ = { canvas: null };

    function init() {
        this._.options.showHmap = true;
        var SCALE = this._.proj.scale();
        _.geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        $.canvas = d3.select('body').append('canvas').style('position', 'absolute').style('display', 'none').style('top', '450px').attr('id', 'webgl-hmap');
        _.canvas = $.canvas.node();
        _.heatmap = createWebGLHeatmap({
            intensityToAlpha: true,
            width: 1024,
            height: 512,
            canvas: _.canvas
        });
        _.texture = new THREE.Texture(_.canvas);
        _.material.map = _.texture;

        if (!hmapUrl) {
            $.canvas.style('display', 'inherit');
            var paintAtCoord = function paintAtCoord(x, y) {
                var count = 0;
                while (count < 200) {
                    var xoff = Math.random() * 2 - 1;
                    var yoff = Math.random() * 2 - 1;
                    var l = xoff * xoff + yoff * yoff;
                    if (l > 1) {
                        continue;
                    }
                    var ls = Math.sqrt(l);
                    xoff /= ls;yoff /= ls;
                    xoff *= 1 - l;yoff *= 1 - l;
                    count += 1;
                    _.heatmap.addPoint(x + xoff * 50, y + yoff * 50, 30, 2 / 300);
                }
            };
            // event handling
            var onTouchMove = function onTouchMove(evt) {
                evt.preventDefault();
                var touches = evt.changedTouches;
                for (var i = 0; i < touches.length; i++) {
                    var touch = touches[i];
                    paintAtCoord(touch.pageX, touch.pageY);
                }
            };
            _.canvas.addEventListener("touchmove", onTouchMove, false);
            _.canvas.onmousemove = function (event) {
                var x = event.offsetX || event.clientX;
                var y = event.offsetY || event.clientY;
                paintAtCoord(x, y);
            };
            _.canvas.onclick = function () {
                _.heatmap.clear();
            };
        }
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            _.sphereObject = new THREE.Mesh(_.geometry, _.material);
            _.sphereObject.name = _.me.name;
        }
        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    function refresh() {
        _.heatmap.update();
        _.heatmap.display();
    }

    return {
        name: 'hmapThreejs',
        urls: hmapUrl && [hmapUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onInterval: function onInterval() {
            if (!hmapUrl) {
                _.texture.needsUpdate = true;
            }
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.countries = topojson.feature(_data, _data.objects.countries);
            } else {
                return _.world;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
// https://stackoverflow.com/questions/22028288/how-to-optimize-rendering-of-many-spheregeometry-in-three-js
// https://threejs.org/docs/#api/materials/PointsMaterial
var dotsThreejs = (function (urlJson) {
    /*eslint no-console: 0 */
    var _ = {
        dataDots: null,
        onHover: {},
        onHoverVals: []
    };

    function createDot(feature, r) {
        var tj = this.threejsPlugin,
            material = new THREE.MeshBasicMaterial({
            color: feature.geometry.color || 0xC19999, //F0C400,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            opacity: 0.5
        }),
            radius = (feature.geometry.radius || 0.5) * 10,
            geometry = new THREE.CircleBufferGeometry(radius, 25),
            mesh = new THREE.Mesh(geometry, material),
            position = tj.vertex(feature.geometry.coordinates, r);
        mesh.position.set(position.x, position.y, position.z);
        mesh.lookAt({ x: 0, y: 0, z: 0 });
        return mesh;
    }

    function hover(event) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _.onHoverVals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var v = _step.value;

                v.call(event.target, event);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    function create() {
        var _this = this;

        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var r = this._.proj.scale() + (this.__plugins('3d').length > 0 ? 4 : 0);
            _.sphereObject = new THREE.Group();
            _.sphereObject.name = _.me.name;
            _.dataDots.features.forEach(function (d) {
                var dot = createDot.call(_this, d, r);
                dot.__data__ = d;
                _.sphereObject.add(dot);
                if (tj.domEvents) {
                    tj.domEvents.addEventListener(dot, 'mousemove', hover, false);
                }
            });
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'dotsThreejs',
        urls: urlJson && [urlJson],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.dataDots = _data;
            } else {
                return _.dataDots;
            }
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) {
                return _.onHover[k];
            });
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

var dotsCThreejs = (function (urlDots) {
    /*eslint no-console: 0 */
    var _ = { dataDots: null };

    function init() {
        var dots = void 0;
        var o = this._.options;
        o.showDots = true;
        this.canvasThreejs.onDraw({
            dotsCThreejs: function dotsCThreejs(context, path) {
                if (o.showDots) {
                    if (!dots) {
                        dots = _.dots.map(function (d) {
                            return d.circle;
                        });
                    }
                    var _g = _.dataDots.geometry || {};
                    context.beginPath();
                    path({ type: 'GeometryCollection', geometries: dots });
                    context.lineWidth = _g.lineWidth || 0.2;
                    context.fillStyle = _g.fillStyle || 'rgba(100,0,0,.4)';
                    context.strokeStyle = _g.strokeStyle || 'rgba(100,0,0,.6)';
                    context.fill();
                    context.stroke();
                }
            }
        });
    }

    function initData() {
        var geoCircle = d3.geoCircle();
        var _g = _.dataDots.geometry || {};
        var _r = _g.radius || 0.5;
        _.dots = _.dataDots.features.map(function (d) {
            var coordinates = d.geometry.coordinates;
            var properties = d.properties;
            var r = d.geometry.radius || _r;
            var circle = geoCircle.center(coordinates).radius(r)();
            return { properties: properties, coordinates: coordinates, circle: circle };
        });
    }

    return {
        name: 'dotsCThreejs',
        urls: urlDots && [urlDots],
        onReady: function onReady(err, dots) {
            _.me.data(dots);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.dataDots = _data;
                initData();
            } else {
                return _.dataDots;
            }
        }
    };
});

var iconsThreejs = (function (jsonUrl, iconUrl) {
    /*eslint no-console: 0 */
    var _ = { sphereObject: null };

    function meshCoordinate(mesh, sc) {
        var phi = (90 - mesh.coordinates[1]) * 0.017453292519943295; //Math.PI / 180.0;
        var the = (360 - mesh.coordinates[0]) * 0.017453292519943295; //Math.PI / 180.0;

        mesh.position.x = sc * Math.sin(phi) * Math.cos(the);
        mesh.position.y = sc * Math.cos(phi);
        mesh.position.z = sc * Math.sin(phi) * Math.sin(the);
        mesh.lookAt({ x: 0, y: 0, z: 0 });
    }

    function loadIcons() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var group = new THREE.Group();
            var SCALE = this._.proj.scale();
            _.data.features.forEach(function (data) {
                var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
                var mesh = new THREE.Mesh(geometry, _.material);
                mesh.coordinates = data.geometry.coordinates;
                meshCoordinate(mesh, SCALE + 1);
                mesh.scale.set(6, 6, 1);
                group.add(mesh);
            });
            _.sphereObject = group;
            _.sphereObject.name = _.me.name;
        }
        tj.addGroup(_.sphereObject);
    }

    function init() {
        var tj = this.threejsPlugin;
        this._.options.showIcons = true;
        _.material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            map: tj.texture(iconUrl)
        });
        if (_.data && !_.loaded) {
            loadIcons.call(this);
            tj.rotate();
        }
    }

    function create() {
        if (_.material && !_.loaded) {
            loadIcons.call(this);
        }
    }

    return {
        name: 'iconsThreejs',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(_data) {
            if (_data) {
                if (_.valuePath) {
                    var p = _.valuePath.split('.');
                    _data.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) {
                            return v = v[o];
                        });
                        d.geometry.value = v;
                    });
                }
                _.data = _data;
            } else {
                return _.data;
            }
        },
        scale: function scale(sc) {
            _.sphereObject.children.forEach(function (mesh) {
                mesh.scale.set(sc + 2, sc + 2, 1);
            });
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
var canvasThreejs = (function (worldUrl) {
    var scw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6.279;
    var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2048;

    /*eslint no-console: 0 */
    var _ = {
        world: null,
        sphereObject: null,
        onHover: {},
        onHoverVals: [],
        style: {},
        onDraw: {},
        onDrawVals: [],
        countries: { type: 'FeatureCollection', features: [] },
        selected: { type: 'FeatureCollection', features: [] },
        material: new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.5
        })
    };

    function init() {
        var r = this._.proj.scale() + (this.__plugins('3d').length > 0 ? 4 : 0);
        _.geometry = new THREE.SphereGeometry(r, 30, 30);
        _.newCanvas = d3.select('body').append('canvas') // document.createElement('canvas');
        .style('display', 'none').attr('class', 'ej-canvas-new').node();
        _.newContext = _.newCanvas.getContext('2d');
        _.texture = new THREE.Texture(_.newCanvas);
        _.texture.transparent = true;
        _.material.map = _.texture;

        var width = height * 2;
        _.canvas = d3.select('body').append('canvas').style('display', 'none').attr('width', width).attr('height', height).attr('class', 'ej-canvas-ctx').node();
        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().scale(width / scw).translate([width / 2, height / 2]);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
        _.path2 = d3.geoPath().projection(_.proj).context(_.newContext);

        //set dimensions
        _.newCanvas.width = _.canvas.width;
        _.newCanvas.height = _.canvas.height;
        _.me._ = _; // only for debugging
    }

    function hover(event) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _.onHoverVals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var v = _step.value;

                v.call(event.target, event);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    function create() {
        var _this = this;

        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            resize.call(this);
            _.sphereObject = new THREE.Mesh(_.geometry, _.material);
            // _.sphereObject.scale.set(1.02,1.02,1.02);
            _.sphereObject.name = _.me.name;
            if (tj.domEvents) {
                tj.domEvents.addEventListener(_.sphereObject, 'mousemove', hover, false);
            }
        }
        _.onDrawVals.forEach(function (v) {
            v.call(_this, _.newContext, _.path);
        });

        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    // stroke adjustment when zooming
    var scale10 = d3.scaleLinear().domain([30, 450]).range([10, 2]);

    function choropleth() {
        var o = this._.options;
        if (o.choropleth) {
            var i = _.countries.features.length;
            while (i--) {
                var obj = _.countries.features[i];
                var color = obj.properties.color || _.style.countries || 'rgba(2, 20, 37,0.8)';
                _.context.beginPath();
                _.path(obj);
                _.context.fillStyle = color;
                _.context.strokeStyle = color;
                _.context.fill();
                _.context.stroke();
            }
            return true;
        } else {
            _.path(_.countries);
            _.context.fillStyle = _.style.countries || 'rgba(2, 20, 37,0.8)';
            _.context.fill();
            return false;
        }
    }

    function resize() {
        var o = this._.options;
        if (_.style.ocean) {
            _.context.fillStyle = _.style.ocean;
            _.context.fillRect(0, 0, _.canvas.width, _.canvas.height);
        } else {
            _.context.clearRect(0, 0, _.canvas.width, _.canvas.height);
        }
        var border = o.showBorder;
        _.context.beginPath();
        if (!border) {
            choropleth.call(this);
        }
        if (!o.choropleth && (o.showBorder || o.showBorder === undefined)) {
            var sc = scale10(this._.proj.scale());
            if (sc < 1) sc = 1;
            if (border) {
                _.path(_.allCountries);
            }
            _.context.lineWidth = sc;
            _.context.strokeStyle = _.style.border || 'rgb(239, 237, 234)';
            _.context.stroke();
        }
        //apply the old canvas to the new one
        _.newContext.drawImage(_.canvas, 0, 0);
        _.refresh = true;
    }

    function _refresh() {
        if (_.refresh && this.hoverCanvas && this._.options.showSelectedCountry) {
            _.refresh = false;
            _.newContext.clearRect(0, 0, _.canvas.width, _.canvas.height);
            _.newContext.drawImage(_.canvas, 0, 0);
            if (_.selected.features.length > 0) {
                _.newContext.beginPath();
                _.path2(_.selected);
                _.newContext.fillStyle = _.style.selected || 'rgba(87, 255, 99, 0.5)'; // 0.4 'rgba(255, 235, 0, 0.4)'; // 'rgba(87, 255, 99, 0.4)';
                _.newContext.fill();
            }

            var _hoverCanvas$states = this.hoverCanvas.states(),
                country = _hoverCanvas$states.country;

            if (country && !_.selected.features.find(function (obj) {
                return obj.id === country.id;
            })) {
                _.newContext.beginPath();
                _.path2(country);
                _.newContext.fillStyle = _.style.hover || 'rgba(117, 0, 0, 0.5)'; // 0.4 'rgb(137, 138, 34)';
                _.newContext.fill();
            }
            _.texture.needsUpdate = true;
            this.threejsPlugin.renderThree();
        }
    }

    return {
        name: 'canvasThreejs',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.data(this.worldJson.data());
            }
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onRefresh: function onRefresh() {
            _refresh.call(this);
        },
        onDraw: function onDraw(obj) {
            Object.assign(_.onDraw, obj);
            _.onDrawVals = Object.keys(_.onDraw).map(function (k) {
                return _.onDraw[k];
            });
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
        selectedCountries: function selectedCountries(arr) {
            if (arr) {
                _.selected.features = arr;
            } else {
                return _.selected.features;
            }
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.allCountries = topojson.feature(_data, _data.objects.countries);
                _.countries.features = _.allCountries.features;
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    countries = _.countries;

                return { world: world, countries: countries };
            }
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        reload: function reload() {
            resize.call(this);
            _refresh.call(this);
        },
        refresh: function refresh() {
            _.refresh = true;
            _refresh.call(this);
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) {
                return _.onHover[k];
            });
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
// https://stackoverflow.com/questions/22028288/how-to-optimize-rendering-of-many-spheregeometry-in-three-js
// https://threejs.org/docs/#api/materials/PointsMaterial
var pointsThreejs = (function (urlJson) {
    //imgUrl='../globe/point3.png'
    /*eslint no-console: 0 */
    var _ = {
        dataPoints: null,
        onHover: {},
        onHoverVals: []
    };

    function init() {
        this._.options.showPoints = true;
    }

    function hover(event) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _.onHoverVals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var v = _step.value;

                v.call(event.target, event);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var particles = new THREE.Geometry();
            _.dataPoints.features.forEach(function (d) {
                var star = new THREE.Vector3();
                var position = tj.vertex(d.geometry.coordinates);
                star.x = position.x;
                star.y = position.y;
                star.z = position.z;
                particles.vertices.push(star);
            });
            var pMaterial = new THREE.PointsMaterial({
                // blending: THREE.AdditiveBlending,
                // map: tj.texture(imgUrl),
                // transparent: true,
                // depthTest: false,
                color: 0xff0000,
                size: 30
            });
            var starField = new THREE.Points(particles, pMaterial);
            _.sphereObject = starField;
            _.sphereObject.name = _.me.name;
            if (tj.domEvents) {
                tj.domEvents.addEventListener(starField, 'mousemove', hover, false);
            }
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'pointsThreejs',
        urls: urlJson && [urlJson],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.dataPoints = _data;
            } else {
                return _.dataPoints;
            }
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) {
                return _.onHover[k];
            });
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
// http://bl.ocks.org/MAKIO135/eab7b74e85ed2be48eeb
var textureThreejs = (function () {
    /*eslint no-console: 0 */
    var _ = {},
        datumGraticule = d3.geoGraticule()();
    var material = new THREE.MeshBasicMaterial();
    var geometry = void 0;

    function init() {
        var __ = this._;
        var SCALE = __.proj.scale();
        var width = __.options.width;
        var height = __.options.height;
        this._.options.showDrawing = true;
        geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        var canvas = d3.select('body').append('canvas');
        canvas.attr('height', height).attr('width', width);
        _.canvas = canvas.node();
        _.context = _.canvas.getContext("2d");
        _.texture = new THREE.Texture(_.canvas);
        _.canvas.width = _.canvas.height = 512;
        _.texture.needsUpdate = true;
        material.map = _.texture;

        var projection = d3.geoMercator().scale(width / 2 / Math.PI).translate([width / 2, height / 2]).precision(0.5);

        _.path = d3.geoPath(projection, _.context);
    }

    function create() {
        var __ = this._;
        var tj = this.threejsPlugin;
        var _$options = __.options,
            width = _$options.width,
            height = _$options.height;

        if (!_.sphereObject) {
            _.context.fillStyle = 'white';
            _.context.fillRect(0, 0, width, height);
            _.context.beginPath();
            _.path(datumGraticule);
            _.context.lineWidth = 0.4;
            _.context.strokeStyle = 'rgba(119,119,119,0.6)';
            _.context.stroke();
            _.sphereObject = new THREE.Mesh(geometry, material);
            _.sphereObject.name = _.me.name;
            _.texture.needsUpdate = false;
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'textureThreejs',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
var graticuleThreejs = (function () {
    /*eslint no-console: 0 */
    var _ = { sphereObject: null };

    function init() {
        _.graticule10 = graticule10();
    }

    // See https://github.com/d3/d3-geo/issues/95
    function graticule10() {
        var epsilon = 1e-6,
            x1 = 180,
            x0 = -x1,
            y1 = 80,
            y0 = -y1,
            dx = 10,
            dy = 10,
            X1 = 180,
            X0 = -X1,
            Y1 = 90,
            Y0 = -Y1,
            DX = 90,
            DY = 360,
            x = graticuleX(y0, y1, 2.5),
            y = graticuleY(x0, x1, 2.5),
            X = graticuleX(Y0, Y1, 2.5),
            Y = graticuleY(X0, X1, 2.5);

        function graticuleX(y0, y1, dy) {
            var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
            return function (x) {
                return y.map(function (y) {
                    return [x, y];
                });
            };
        }

        function graticuleY(x0, x1, dx) {
            var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
            return function (y) {
                return x.map(function (x) {
                    return [x, y];
                });
            };
        }

        return {
            type: "MultiLineString",
            coordinates: d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function (x) {
                return Math.abs(x % DX) > epsilon;
            }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function (y) {
                return Math.abs(y % DY) > epsilon;
            }).map(y))
        };
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            // linewidth always: 1
            var material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
            _.sphereObject = tj.wireframe(_.graticule10, material); //0x800000
            _.sphereObject.name = _.me.name;
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'graticuleThreejs',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// http://callumprentice.github.io/apps/flight_stream/index.html
// https://stackoverflow.com/questions/9695687/javascript-converting-colors-numbers-strings-vice-versa
var flightLineThreejs = (function (jsonUrl, imgUrl) {
    var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 150;

    /*eslint no-console: 0 */
    var _ = {
        data: [],
        sphereObject: null,
        track_lines_object: null,
        track_points_object: null,
        lightFlow: true,
        linewidth: 3,
        texture: null,
        maxVal: 1,
        onHover: {},
        onHoverVals: []
    };
    var lineScale = d3.scaleLinear().domain([30, 2500]).range([0.001, 0.005]);
    var PI180 = Math.PI / 180.0;

    var colorRange = [d3.rgb('#ff0000'), d3.rgb("#aaffff")];
    var min_arc_distance = +Infinity;
    var max_arc_distance = -Infinity;
    var cur_arc_distance = 0;
    var point_spacing = 100;
    var point_opacity = 0.8;
    var point_speed = 1.0;
    var point_cache = [];
    var all_tracks = [];

    var ttl_num_points = 0;
    function generateControlPoints(radius) {
        for (var f = 0; f < _.data.length; ++f) {
            var start_lat = _.data[f][0];
            var start_lng = _.data[f][1];
            var end_lat = _.data[f][2];
            var end_lng = _.data[f][3];
            var value = _.data[f][4];

            if (start_lat === end_lat && start_lng === end_lng) {
                continue;
            }

            var points = [];
            var spline_control_points = 8;
            var max_height = Math.random() * height + 0.05;
            for (var i = 0; i < spline_control_points + 1; i++) {
                var arc_angle = i * 180.0 / spline_control_points;
                var arc_radius = radius + Math.sin(arc_angle * PI180) * max_height;
                var latlng = lat_lng_inter_point(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);
                var pos = xyz_from_lat_lng(latlng.lat, latlng.lng, arc_radius);

                points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
            }

            var point_positions = [];
            var spline = new THREE.CatmullRomCurve3(points);
            var arc_distance = lat_lng_distance(start_lat, start_lng, end_lat, end_lng, radius);
            for (var t = 0; t < arc_distance; t += point_spacing) {
                var offset = t / arc_distance;
                point_positions.push(spline.getPoint(offset));
            }

            var arc_distance_miles = arc_distance / (2 * Math.PI) * 24901;
            if (arc_distance_miles < min_arc_distance) {
                min_arc_distance = arc_distance_miles;
            }

            if (arc_distance_miles > max_arc_distance) {
                max_arc_distance = parseInt(Math.ceil(arc_distance_miles / 1000.0) * 1000);
                cur_arc_distance = max_arc_distance;
            }
            var color = value ? _.color(value) : 'rgb(255,255,255)';
            var default_speed = Math.random() * 600 + 400;
            var speed = default_speed * point_speed;
            var num_points = parseInt(arc_distance / point_spacing) + 1;
            var spd_points = speed * num_points;
            ttl_num_points += num_points;

            all_tracks.push({
                spline: spline,
                num_points: num_points,
                spd_points: spd_points,
                arc_distance: arc_distance,
                arc_distance_miles: arc_distance_miles,
                point_positions: point_positions,
                default_speed: default_speed,
                value: value,
                color: color,
                speed: speed
            });
        }
    }

    function xyz_from_lat_lng(lat, lng, radius) {
        var phi = (90 - lat) * PI180;
        var theta = (360 - lng) * PI180;
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    }

    function lat_lng_distance(lat1, lng1, lat2, lng2, radius) {
        var a = Math.sin((lat2 - lat1) * PI180 / 2) * Math.sin((lat2 - lat1) * PI180 / 2) + Math.cos(lat1 * PI180) * Math.cos(lat2 * PI180) * Math.sin((lng2 - lng1) * PI180 / 2) * Math.sin((lng2 - lng1) * PI180 / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
    }

    function lat_lng_inter_point(lat1, lng1, lat2, lng2, offset) {
        lat1 = lat1 * PI180;
        lng1 = lng1 * PI180;
        lat2 = lat2 * PI180;
        lng2 = lng2 * PI180;

        var d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));
        var A = Math.sin((1 - offset) * d) / Math.sin(d);
        var B = Math.sin(offset * d) / Math.sin(d);
        var x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
        var y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
        var z = A * Math.sin(lat1) + B * Math.sin(lat2);
        var lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
        var lng = Math.atan2(y, x) * 180 / Math.PI;

        return {
            lat: lat,
            lng: lng
        };
    }

    var positions = void 0;
    function generate_point_cloud() {
        positions = new Float32Array(ttl_num_points * 3);
        var colors = new Float32Array(ttl_num_points * 3);
        var values = new Float32Array(ttl_num_points);
        var sizes = new Float32Array(ttl_num_points);

        var index = 0;
        for (var i = 0; i < all_tracks.length; ++i) {
            var _all_tracks$i = all_tracks[i],
                value = _all_tracks$i.value,
                color = _all_tracks$i.color,
                point_positions = _all_tracks$i.point_positions;

            var _ref = new THREE.Color(color),
                r = _ref.r,
                g = _ref.g,
                b = _ref.b; //.setHSL(1-value/_.maxVal, 0.4, 0.8);


            var pSize = _.point(value || 1);
            for (var j = 0; j < point_positions.length; ++j) {

                positions[3 * index + 0] = 0;
                positions[3 * index + 1] = 0;
                positions[3 * index + 2] = 0;

                colors[3 * index + 0] = r;
                colors[3 * index + 1] = g;
                colors[3 * index + 2] = b;
                values[index] = value || 1;
                sizes[index] = pSize; //_.point_size;

                ++index;
            }
            point_cache[i] = [];
        }

        var point_cloud_geom = new THREE.BufferGeometry();
        point_cloud_geom.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        point_cloud_geom.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        point_cloud_geom.addAttribute('value', new THREE.BufferAttribute(values, 1));
        point_cloud_geom.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
        point_cloud_geom.computeBoundingBox();

        _.track_points_object = new THREE.Points(point_cloud_geom, _.shaderMaterial);
        _.attr_position = _.track_points_object.geometry.attributes.position;
        return _.track_points_object;
    }

    function update_point_cloud() {
        var i_length = all_tracks.length;
        var dates = Date.now();
        var index = 0;
        for (var i = 0; i < i_length; ++i) {
            var _all_tracks$i2 = all_tracks[i],
                speed = _all_tracks$i2.speed,
                spline = _all_tracks$i2.spline,
                num_points = _all_tracks$i2.num_points,
                spd_points = _all_tracks$i2.spd_points,
                arc_distance = _all_tracks$i2.arc_distance,
                arc_distance_miles = _all_tracks$i2.arc_distance_miles;


            if (arc_distance_miles <= cur_arc_distance) {
                var normalized = point_spacing / arc_distance;
                var time_scale = dates % speed / spd_points;
                for (var j = 0; j < num_points; j++) {
                    var t = j * normalized + time_scale;

                    var _fast_get_spline_poin = fast_get_spline_point(i, t, spline),
                        x = _fast_get_spline_poin.x,
                        y = _fast_get_spline_poin.y,
                        z = _fast_get_spline_poin.z;

                    var index3 = 3 * index;
                    positions[index3 + 0] = x;
                    positions[index3 + 1] = y;
                    positions[index3 + 2] = z;
                    index++;
                }
            } else {
                for (var _j = 0; _j < num_points; _j++) {
                    var _index = 3 * index;
                    positions[_index + 0] = Infinity;
                    positions[_index + 1] = Infinity;
                    positions[_index + 2] = Infinity;
                    index++;
                }
            }
        }
        _.attr_position.needsUpdate = true;
    }

    function fast_get_spline_point(i, t, spline) {
        // point_cache set in generate_point_cloud()
        var pcache = point_cache[i];
        var tc = parseInt(t * 1000);
        if (pcache[tc] === undefined) {
            pcache[tc] = spline.getPoint(t);
        }
        return pcache[tc];
    }

    var line_opacity = 0.4;
    var curve_points = 24;
    var curve_length = curve_points - 1;
    var material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        opacity: line_opacity,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        color: 0xffffff,
        linewidth: _.linewidth
    });
    function generate_track_lines() {
        var _all_tracks = all_tracks,
            length = _all_tracks.length;

        var total_arr = length * 6 * curve_points;
        var geometry = new THREE.BufferGeometry();
        var colors = new Float32Array(total_arr);
        var line_positions = new Float32Array(total_arr);

        for (var i = 0; i < length; ++i) {
            var l = i * curve_points;
            var _all_tracks$i3 = all_tracks[i],
                spline = _all_tracks$i3.spline,
                color = _all_tracks$i3.color;

            var _ref2 = new THREE.Color(color),
                r = _ref2.r,
                g = _ref2.g,
                b = _ref2.b;

            for (var j = 0; j < curve_length; ++j) {
                var k = j + 1;
                var c1 = spline.getPoint(j / curve_length);
                var c2 = spline.getPoint(k / curve_length);
                line_positions[i_curve + 0] = c1.x;
                line_positions[i_curve + 1] = c1.y;
                line_positions[i_curve + 2] = c1.z;
                line_positions[i_curve + 3] = c2.x;
                line_positions[i_curve + 4] = c2.y;
                line_positions[i_curve + 5] = c2.z;

                var i_curve = (j + l) * 6;
                colors[i_curve + 0] = r;
                colors[i_curve + 1] = g;
                colors[i_curve + 2] = b;
                colors[i_curve + 3] = r;
                colors[i_curve + 4] = g;
                colors[i_curve + 5] = b;
            }
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(line_positions, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();
        _.track_lines_object = new THREE.Line(geometry, material, THREE.LineSegments);

        return _.track_lines_object;
    }

    // const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    function generate_track_lines2() {
        var _all_tracks2 = all_tracks,
            length = _all_tracks2.length;

        var group = new THREE.Group();
        var lineWidth = lineScale(_.SCALE); // this._.proj.scale()
        for (var i = 0; i < length; ++i) {
            var _all_tracks$i4 = all_tracks[i],
                spline = _all_tracks$i4.spline,
                color = _all_tracks$i4.color;

            var lines = new Float32Array(3 * curve_points);
            var _material = new MeshLineMaterial({
                color: new THREE.Color(color),
                useMap: false,
                opacity: 1,
                lineWidth: lineWidth
            });
            for (var j = 0; j <= curve_length; ++j) {
                var i_curve = j * 3;

                var _spline$getPoint = spline.getPoint(j / curve_length),
                    x = _spline$getPoint.x,
                    y = _spline$getPoint.y,
                    z = _spline$getPoint.z;

                lines[i_curve + 0] = x;
                lines[i_curve + 1] = y;
                lines[i_curve + 2] = z;
            }
            var meshLine = new MeshLine();
            meshLine.setGeometry(lines);
            group.add(new THREE.Mesh(meshLine.geometry, _material));
        }
        _.track_lines_object = group;
        return _.track_lines_object;
    }

    var vertexshader = '\n    attribute float size;\n    attribute vec3 customColor;\n    varying vec3 vColor;\n\n    void main() {\n        vColor = customColor;\n        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n        gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );\n        gl_Position = projectionMatrix * mvPosition;\n    }';

    var fragmentshader = '\n    uniform vec3 color;\n    uniform sampler2D texture;\n    uniform float opacity;\n\n    varying vec3 vColor;\n\n    void main() {\n        gl_FragColor = vec4( color * vColor, opacity );\n        gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );\n    }';

    function loadFlights() {
        var uniforms = {
            color: {
                type: "c",
                value: new THREE.Color(0xaaaaaa)
            },
            texture: {
                type: "t",
                value: _.texture
            },
            opacity: {
                type: "f",
                value: point_opacity
            }
        };
        _.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexshader,
            fragmentShader: fragmentshader,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true
        });

        var group = new THREE.Group();
        generateControlPoints(_.SCALE + 1);
        group.add(!window.MeshLineMaterial ? generate_track_lines.call(this) : generate_track_lines2.call(this));
        group.add(generate_point_cloud.call(this));
        group.name = 'flightLineThreejs';
        if (this.threejsPlugin.domEvents) {
            this.threejsPlugin.domEvents.addEventListener(_.track_lines_object, 'mousemove', function (event) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _.onHoverVals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var v = _step.value;

                        v.call(event.target, event);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }, false);
        }
        _.sphereObject = group;
        _.sphereObject.name = _.me.name;
        _.loaded = true;
    }

    function init() {
        _.SCALE = this._.proj.scale() + (this.__plugins('3d').length > 0 ? 4 : 0);
        _.texture = this.threejsPlugin.texture(imgUrl);
    }

    function create() {
        if (_.texture && !_.sphereObject && !_.loaded) {
            loadFlights.call(this);
        }
        var tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    function _reload() {
        all_tracks = [];
        point_cache = [];
        loadFlights.call(this);
        var tj = this.threejsPlugin;
        var arr = tj.group.children;
        var idx = arr.findIndex(function (obj) {
            return obj.name === 'flightLineThreejs';
        });
        tj.group.remove(arr[idx]);
        tj.group.add(_.sphereObject);
        tj.renderThree();
    }

    var start = 0;
    function interval(timestamp) {
        if (timestamp - start > 30) {
            start = timestamp;
            update_point_cloud();
            this.threejsPlugin.renderThree();
        }
    }

    function resize() {
        var ps = this._.proj.scale();
        var sc = _.resize(ps);
        var pt = _.sphereObject.children[1];
        var _pt$geometry$attribut = pt.geometry.attributes,
            size = _pt$geometry$attribut.size,
            value = _pt$geometry$attribut.value;

        size.array = value.array.map(function (v) {
            return _.point(v) * sc;
        });
        size.needsUpdate = true;

        if (window.MeshLineMaterial) {
            _.track_lines_object.children.forEach(function (mesh) {
                mesh.material.uniforms.lineWidth.value = lineScale(ps);
                mesh.material.needsUpdate = true;
            });
        }
    }

    return {
        name: 'flightLineThreejs',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
            this._.options.showFlightLine = true;
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onInterval: function onInterval(t) {
            if (!this._.drag && _.lightFlow) interval.call(this, t);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) {
                return _.onHover[k];
            });
        },
        reload: function reload() {
            _reload.call(this);
        },
        data: function data(_data, colorR) {
            var pointR = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [50, 500];
            var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 150;
            var o = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.8;

            if (_data) {
                _.data = _data;
                if (colorR) {
                    if (!Array.isArray(colorR)) {
                        colorR = ['#ff0000', '#aaffff'];
                    }
                    var d = d3.extent(_data.map(function (x) {
                        return x[4];
                    }));
                    colorRange = [d3.rgb(colorR[0]), d3.rgb(colorR[1])];
                    _.color = d3.scaleLinear().domain(d).interpolate(d3.interpolateHcl).range(colorRange);
                    _.point = d3.scaleLinear().domain(d).range(pointR);
                    _.maxVal = d[1];
                } else {
                    _.color = function () {
                        return 'rgb(255, 255, 255)';
                    };
                    _.point = function () {
                        return 150;
                    };
                    _.maxVal = 1;
                }
                height = h;
                point_opacity = o;
                _.resize = d3.scaleLinear().domain([30, this._.proj.scale()]).range([0.1, 1]);
            } else {
                return _.data;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
        pointSize: function pointSize(one) {
            var pt = _.sphereObject.children[1];
            var size = pt.geometry.attributes.size;

            size.array = size.array.map(function (v) {
                return v * one;
            });
            size.needsUpdate = true;
        },
        lightFlow: function lightFlow(forceState) {
            if (forceState !== undefined) {
                _.lightFlow = forceState;
            } else {
                return _.lightFlow;
            }
        }
    };
});

// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
var oceanThreejs = (function (color) {
    var color2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0xAAAAAA;

    /*eslint no-console: 0 */
    var _ = { sphereObject: null };
    if (color) {
        _.material = new THREE.MeshPhongMaterial({ color: color });
    } else {
        _.material = new THREE.MeshNormalMaterial({
            transparent: false,
            wireframe: false,
            opacity: 0.8
        });
    }
    _.material.transparent = true;

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var r = this._.proj.scale() - (this.__plugins('3d').length > 0 ? 5 : 0);
            var geometry = new THREE.SphereGeometry(r, 30, 30);
            if (color) {
                var ambient = new THREE.AmbientLight(color2);
                var mesh = new THREE.Mesh(geometry, _.material);
                _.sphereObject = new THREE.Group();
                _.sphereObject.add(ambient);
                _.sphereObject.add(mesh);
            } else {
                _.sphereObject = new THREE.Mesh(geometry, _.material);
            }
            _.sphereObject.name = _.me.name;
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'oceanThreejs',
        onInit: function onInit(me) {
            _.me = me;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// https://threejs.org/docs/#api/materials/Material
var imageThreejs = (function () {
    var imgUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../globe/world.png';

    /*eslint no-console: 0 */
    var _ = { sphereObject: null };

    function init() {
        var tj = this.threejsPlugin;
        _.material = new THREE.MeshBasicMaterial({
            map: tj.texture(imgUrl),
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.5
        });
        Object.defineProperty(_.me, 'transparent', {
            get: function get() {
                return _.transparent;
            },
            set: function set(x) {
                _.transparent = x;
                if (x) {
                    _.material.side = THREE.DoubleSide;
                    _.material.alphaTest = 0.01;
                } else {
                    _.material.side = THREE.FrontSide;
                    _.material.alphaTest = 0;
                }
                _.material.needsUpdate = true;
            }
        });
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var r = this._.proj.scale() + (this.__plugins('3d').length > 0 ? 4 : 0);
            var geometry = new THREE.SphereGeometry(r, 30, 30);
            _.sphereObject = new THREE.Mesh(geometry, _.material);
            // _.sphereObject.scale.set(1.02,1.02,1.02);
            _.sphereObject.name = _.me.name;
            tj.addGroup(_.sphereObject);
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'imageThreejs',
        onInit: function onInit(me) {
            _.me = me;
            _.transparent = false;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// https://armsglobe.chromeexperiments.com/
var inertiaThreejs = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { zoomScale: [0, 50000] },
        zoomScale = _ref.zoomScale;

    /*eslint no-console: 0 */
    var _ = {};

    var rotateX = 0,
        rotateY = 0,
        rotateVX = 0,
        rotateVY = 0;

    var dragging = false,
        rendering = false,
        draggMove = undefined;

    var rotateXMax = 90 * Math.PI / 180;

    function inertiaDrag() {
        if (!rendering) {
            _.removeEventQueue(_.me.name, 'onTween');
            return;
        }

        rotateX += rotateVX;
        rotateY += rotateVY;

        rotateVX *= 0.98;
        rotateVY *= 0.98;

        if (dragging) {
            rotateVX *= 0.6;
            rotateVY *= 0.6;
        }

        if (rotateX < -rotateXMax) {
            rotateX = -rotateXMax;
            rotateVX *= -0.95;
        }

        if (rotateX > rotateXMax) {
            rotateX = rotateXMax;
            rotateVX *= -0.95;
        }

        if (!dragging && _.rotation.x.toPrecision(5) === rotateX.toPrecision(5) && _.rotation.y.toPrecision(5) === rotateY.toPrecision(5)) {
            rendering = false;
        } else {
            _.rotation.x = rotateX;
            _.rotation.y = rotateY;
            _.renderThree(true);
        }
    }

    function mouseLocation() {
        var r = _.node.getClientRects()[0];
        var t = d3.event.touches ? d3.event.touches[0] : d3.event;
        return [t.clientX - r.width * 0.5, t.clientY - r.height * 0.5];
    }

    var cmouse = void 0,
        pmouse = void 0;
    function onStartDrag() {
        dragging = true;
        rendering = true;
        draggMove = null;
        cmouse = mouseLocation();
        _.removeEventQueue(_.me.name, 'onTween');
    }

    function onDragging() {
        if (dragging) {
            pmouse = cmouse;
            draggMove = true;
            cmouse = mouseLocation();
            rotateVY += (cmouse[0] - pmouse[0]) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
            rotateVX += (cmouse[1] - pmouse[1]) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
            rotateX = _.rotation.x;
            rotateY = _.rotation.y;
            inertiaDrag.call(_.this);
        }
    }

    function onEndDrag() {
        dragging = false;
        if (draggMove) {
            draggMove = false;
            _.addEventQueue(_.me.name, 'onTween');
        }
    }

    function init() {
        var s0 = this._.proj.scale();
        var _ref2 = this._,
            proj = _ref2.proj,
            options = _ref2.options;
        var width = options.width,
            height = options.height;

        var scale = d3.scaleLinear().domain([0, s0]).range([0, 1]);
        function zoom() {
            var z = zoomScale;
            var r1 = s0 * d3.event.transform.k;
            if (r1 >= z[0] && r1 <= z[1]) {
                var s = scale(r1);
                proj.scale(r1);
                _.scale.x = s;
                _.scale.y = s;
                _.scale.z = s;
                _.renderThree(true);
            }
        }

        this._.svg.on('mousedown touchstart', onStartDrag).on('mousemove touchmove', onDragging).on('mouseup touchend', onEndDrag);

        this._.svg.call(d3.zoom().on('zoom', zoom).scaleExtent([0.1, 160]).translateExtent([[0, 0], [width, height]]).filter(function () {
            var _d3$event = d3.event,
                touches = _d3$event.touches,
                type = _d3$event.type;

            return type === 'wheel' || touches;
        }));
    }

    function create() {
        _.tj = this.threejsPlugin;
        _.node = this._.svg.node();
        _.scale = _.tj.group.scale;
        _.rotation = _.tj.group.rotation;
        _.renderThree = _.tj.renderThree;
        _.addEventQueue = this.__addEventQueue;
        _.removeEventQueue = this.__removeEventQueue;
    }

    return {
        name: 'inertiaThreejs',
        onInit: function onInit(me) {
            _.me = me;
            _.this = this;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onTween: function onTween() {
            // requestAnimationFrame()
            inertiaDrag.call(this);
        }
    };
});

var worldThreejs = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../globe/world.png';

    /*eslint no-console: 0 */
    var _ = {
        world: null,
        land: null,
        lakes: { type: 'FeatureCollection', features: [] },
        selected: { type: 'FeatureCollection', features: [] },
        countries: { type: 'FeatureCollection', features: [] }
    };

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var mesh = topojson.mesh(_.world, _.world.objects.countries);
            var material = new THREE.MeshBasicMaterial({ color: 0x707070 });
            var r = this._.proj.scale() + (this.__plugins('3d').length > 0 ? 4 : 0);
            _.sphereObject = tj.wireframe(mesh, material, r);
            _.sphereObject.name = _.me.name;
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'worldThreejs',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showLand = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.land = topojson.feature(_data, _data.objects.land);
                _.countries.features = topojson.feature(_data, _data.objects.countries).features;
                if (_data.objects.ne_110m_lakes) _.lakes.features = topojson.feature(_data, _data.objects.ne_110m_lakes).features;
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world = all.world;
                _.land = all.land;
                _.lakes = all.lakes;
                _.countries = all.countries;
            } else {
                var world = _.world,
                    land = _.land,
                    lakes = _.lakes,
                    countries = _.countries;

                return { world: world, land: land, lakes: lakes, countries: countries };
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

var globeThreejs = (function () {
    var imgUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../globe/world_1.jpg';
    var elvUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '../globe/earth_elevation.jpg';
    var wtrUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '../globe/earth_water.png';

    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null,
        onHover: {},
        onHoverVals: []
    };

    function init() {
        this._.options.showGlobe = true;
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var earth_img = tj.texture(imgUrl);
            var elevt_img = tj.texture(elvUrl);
            var water_img = tj.texture(wtrUrl);
            var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            var material = new THREE.MeshPhongMaterial({
                map: earth_img,
                bumpMap: elevt_img,
                bumpScale: 0.01,
                specularMap: water_img,
                specular: new THREE.Color('grey')
            });
            _.sphereObject = new THREE.Mesh(geometry, material);
            _.sphereObject.name = _.me.name;
            if (this.threejsPlugin.domEvents) {
                this.threejsPlugin.domEvents.addEventListener(_.sphereObject, 'mousemove', function (event) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = _.onHoverVals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var v = _step.value;

                            v.call(event.target, event);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }, false);
            }
            var ambient = new THREE.AmbientLight(0x777777);
            var light1 = new THREE.DirectionalLight(0xffffff, 0.2);
            var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
            light1.position.set(5, 3, 6);
            light2.position.set(5, 3, -6);
            tj.addGroup(ambient);
            tj.addGroup(light1);
            tj.addGroup(light2);
            tj.addGroup(_.sphereObject);
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'globeThreejs',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) {
                return _.onHover[k];
            });
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

var sphereThreejs = (function () {
  var imgUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../globe/world.png';

  /*eslint no-console: 0 */
  var _ = { sphereObject: null };
  var Shaders = {
    'earth': {
      uniforms: {
        'texture': { type: 't', value: null }
      },
      vertexShader: ['varying vec3 vNormal;', 'varying vec2 vUv;', 'void main() {', 'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );', 'vNormal = normalize( normalMatrix * normal );', 'vUv = uv;', '}'].join('\n'),
      fragmentShader: ['uniform sampler2D texture;', 'varying vec3 vNormal;', 'varying vec2 vUv;', 'void main() {', 'vec3 diffuse = texture2D( texture, vUv ).xyz;', 'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );', 'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );', 'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );', '}'].join('\n')
    },
    'atmosphere': {
      uniforms: {},
      vertexShader: ['varying vec3 vNormal;', 'void main() {', 'vNormal = normalize( normalMatrix * normal );', 'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );', '}'].join('\n'),
      fragmentShader: ['varying vec3 vNormal;', 'void main() {', 'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );', 'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;', '}'].join('\n')
    }
  };

  function create() {
    var tj = this.threejsPlugin;
    if (!_.sphereObject) {
      var SCALE = this._.proj.scale();
      var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
      var uniforms1 = THREE.UniformsUtils.clone(Shaders.earth.uniforms);
      var uniforms2 = THREE.UniformsUtils.clone(Shaders.atmosphere.uniforms);
      uniforms1['texture'].value = tj.texture(imgUrl);

      var mesh1 = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
        uniforms: uniforms1,
        vertexShader: Shaders.earth.vertexShader,
        fragmentShader: Shaders.earth.fragmentShader
      }));

      var mesh2 = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
        uniforms: uniforms2,
        vertexShader: Shaders.atmosphere.vertexShader,
        fragmentShader: Shaders.atmosphere.fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      }));

      var group = new THREE.Group();
      group.add(mesh1);
      group.add(mesh2);
      _.sphereObject = group;
      _.sphereObject.name = _.me.name;
      tj.addGroup(_.sphereObject);
      // tj.rotate();
    } else {
      tj.addGroup(_.sphereObject);
    }
  }

  return {
    name: 'sphereThreejs',
    onInit: function onInit(me) {
      _.me = me;
      this._.options.showSphere = true;
    },
    onCreate: function onCreate() {
      create.call(this);
    },
    sphere: function sphere() {
      return _.sphereObject;
    },
    imgSrc: function imgSrc(imgUrl) {
      var tj = this.threejsPlugin;

      var material = _.me.sphere().children[0].material;

      material.uniforms.texture.value = tj.texture(imgUrl);
      material.needsUpdate = true;
    }
  };
});

function Map3DGeometry(data, innerRadius) {
    /*eslint no-redeclare: 0 */
    if (arguments.length < 2 || isNaN(parseFloat(innerRadius)) || !isFinite(innerRadius) || innerRadius < 0) {
        // if no valid inner radius is given, do not extrude
        innerRadius = 42;
    }

    THREE.Geometry.call(this);
    // data.vertices = [lat, lon, ...]
    // data.polygons = [[poly indices, hole i-s, ...], ...]
    // data.triangles = [tri i-s, ...]
    var i,
        uvs = [];
    for (i = 0; i < data.vertices.length; i += 2) {
        var lon = data.vertices[i];
        var lat = data.vertices[i + 1];
        // colatitude
        var phi = +(90 - lat) * 0.01745329252;
        // azimuthal angle
        var the = +(180 - lon) * 0.01745329252;
        // translate into XYZ coordinates
        var wx = Math.sin(the) * Math.sin(phi) * -1;
        var wz = Math.cos(the) * Math.sin(phi);
        var wy = Math.cos(phi);
        // equirectangular projection
        var wu = 0.25 + lon / 360.0;
        var wv = 0.5 + lat / 180.0;

        this.vertices.push(new THREE.Vector3(wx, wy, wz));

        uvs.push(new THREE.Vector2(wu, wv));
    }

    var n = this.vertices.length;

    if (innerRadius <= 1) {
        for (i = 0; i < n; i++) {
            var v = this.vertices[i];
            this.vertices.push(v.clone().multiplyScalar(innerRadius));
        }
    }

    for (i = 0; i < data.triangles.length; i += 3) {
        var a = data.triangles[i];
        var b = data.triangles[i + 1];
        var c = data.triangles[i + 2];

        this.faces.push(new THREE.Face3(a, b, c, [this.vertices[a], this.vertices[b], this.vertices[c]]));
        this.faceVertexUvs[0].push([uvs[a], uvs[b], uvs[c]]);

        if (0 < innerRadius && innerRadius <= 1) {
            this.faces.push(new THREE.Face3(n + b, n + a, n + c, [this.vertices[b].clone().multiplyScalar(-1), this.vertices[a].clone().multiplyScalar(-1), this.vertices[c].clone().multiplyScalar(-1)]));
            this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[c]]); // shitty uvs to make 3js exporter happy
        }
    }

    // extrude
    if (innerRadius < 1) {
        for (i = 0; i < data.polygons.length; i++) {
            var polyWithHoles = data.polygons[i];
            for (var j = 0; j < polyWithHoles.length; j++) {
                var polygonOrHole = polyWithHoles[j];
                for (var k = 0; k < polygonOrHole.length; k++) {
                    var a = polygonOrHole[k],
                        b = polygonOrHole[(k + 1) % polygonOrHole.length];
                    var va1 = this.vertices[a],
                        vb1 = this.vertices[b];
                    var va2 = this.vertices[n + a]; //, vb2 = this.vertices[n + b];
                    var normal;
                    if (j < 1) {
                        // polygon
                        normal = vb1.clone().sub(va1).cross(va2.clone().sub(va1)).normalize();
                        this.faces.push(new THREE.Face3(a, b, n + a, [normal, normal, normal]));
                        this.faceVertexUvs[0].push([uvs[a], uvs[b], uvs[a]]); // shitty uvs to make 3js exporter happy
                        if (innerRadius > 0) {
                            this.faces.push(new THREE.Face3(b, n + b, n + a, [normal, normal, normal]));
                            this.faceVertexUvs[0].push([uvs[b], uvs[b], uvs[a]]); // shitty uvs to make 3js exporter happy
                        }
                    } else {
                        // hole
                        normal = va2.clone().sub(va1).cross(vb1.clone().sub(va1)).normalize();
                        this.faces.push(new THREE.Face3(b, a, n + a, [normal, normal, normal]));
                        this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[a]]); // shitty uvs to make 3js exporter happy
                        if (innerRadius > 0) {
                            this.faces.push(new THREE.Face3(b, n + a, n + b, [normal, normal, normal]));
                            this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[b]]); // shitty uvs to make 3js exporter happy
                        }
                    }
                }
            }
        }
    }

    this.computeFaceNormals();

    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1);
}
if (window.THREE) {
    Map3DGeometry.prototype = Object.create(THREE.Geometry.prototype);
}

// import data from './globe';
var world3dThreejs = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world.geometry.json';
    var imgUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '../globe/gold.jpg';
    var inner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.9;
    var rtt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1.57;

    /*eslint no-console: 0 */
    var _ = {
        style: {},
        tween: null,
        sphereObject: new THREE.Group()
    };
    var vertexShader = '\nvarying vec2 vN;\nvoid main() {\nvec4 p = vec4( position, 1. );\nvec3 e = normalize( vec3( modelViewMatrix * p ) );\nvec3 n = normalize( normalMatrix * normal );\nvec3 r = reflect( e, n );\nfloat m = 2. * length( vec3( r.xy, r.z + 1. ) );\nvN = r.xy / m + .5;\ngl_Position = projectionMatrix * modelViewMatrix * p;\n}';
    var fragmentShader = '\nuniform sampler2D sampler;\nuniform vec3 diffuse;\nvarying vec2 vN;\nvoid main() {\nvec4 tex = texture2D( sampler, vN );\ngl_FragColor = tex + vec4( diffuse, 0 ) * 0.5;\n}';
    function init() {
        var r = this._.proj.scale();
        this._.options.showWorld = true;
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(r, r, r);
        _.sphereObject.name = _.me.name;
    }

    var material = void 0,
        uniforms = void 0;
    function create() {
        var data = _.world;
        var tj = this.threejsPlugin;
        var choropleth = this._.options.choropleth;

        _.uniforms = {
            sampler: { type: 't', value: tj.texture(imgUrl) },
            diffuse: { type: 'c', value: new THREE.Color(_.style.land || 'black') }
        };
        for (var name in data) {
            if (choropleth) {
                var properties = data[name].properties || { color: _.style.countries };
                var diffuse = { type: 'c', value: new THREE.Color(properties.color || 'black') };
                uniforms = Object.assign({}, _.uniforms, { diffuse: diffuse });
            } else {
                uniforms = _.uniforms;
            }
            var geometry = new Map3DGeometry(data[name], inner);
            material = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader });
            _.sphereObject.add(data[name].mesh = new THREE.Mesh(geometry, material));
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'world3dThreejs',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
            Object.defineProperty(me, 'tween', {
                get: function get() {
                    return _.tween;
                },
                set: function set(x) {
                    _.tween = x;
                    // this.__addEventQueue(_.me.name, 'onTween');
                }
            });
        },
        onCreate: function onCreate() {
            create.call(this);
            // this.__removeEventQueue(_.me.name, 'onTween');
        },
        onTween: function onTween() {
            _.tween && _.tween.call(this);
        },
        rotate: function rotate(rtt) {
            _.sphereObject.rotation.y = rtt;
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
            } else {
                return _.world;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        extrude: function extrude(inner) {
            for (var name in _.world) {
                var dataItem = _.world[name];
                dataItem.mesh.geometry = new Map3DGeometry(dataItem, inner);
            }
        }
    };
});

// view-source:http://callumprentice.github.io/apps/extruded_earth/index.html
var world3dThreejs2 = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/countries.geo.json';
    var landUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '../globe/gold.jpg';
    var inner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.9;
    var outer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var rtt = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    /*eslint no-console: 0 */
    var _ = {
        group: {},
        sphereObject: null,
        material: new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xaa9933),
            side: THREE.DoubleSide
        })
    };

    function _extrude(geometry) {
        var _i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.9;

        var _o = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        var half = geometry.vertices.length / 2;
        geometry.vertices.forEach(function (vert, i) {
            var r = _i;
            if (i >= half) {
                r = 1 + _o;
            }
            var phi = (90.0 - vert.oy) * 0.017453292519943295; //Math.PI / 180.0;
            var the = (360.0 - vert.ox) * 0.017453292519943295; //Math.PI / 180.0;
            vert.x = r * Math.sin(phi) * Math.cos(the);
            vert.y = r * Math.cos(phi);
            vert.z = r * Math.sin(phi) * Math.sin(the);
        });
        geometry.verticesNeedUpdate = true;
        geometry.computeFaceNormals();
    }

    var material = void 0;
    function add_country(shape_points) {
        var shape = new THREE.Shape(shape_points);
        var geometry = new THREE.ExtrudeGeometry(shape, {
            bevelEnabled: false,
            amount: 16
        });
        geometry.vertices.forEach(function (vert) {
            vert.ox = vert.x;
            vert.oy = vert.y;
            vert.oz = vert.z;
        });
        _extrude(geometry, inner, outer);
        return new THREE.Mesh(geometry, material);
    }

    function shapePoints(country, list) {
        var id = country.id,
            shape_points = [];
        var _g = _.group[id];
        if (_g === undefined) {
            _g = new THREE.Group();
            _g.name = id;
            _.group[id] = _g;
            _.sphereObject.add(_g);
        }
        list.forEach(function (points) {
            shape_points.push(new THREE.Vector2(points[0], points[1]));
        });
        var mesh = add_country(shape_points);
        mesh.cid = country.properties.cid;
        _g.add(mesh);
    }

    function loadCountry() {
        var choropleth = this._.options.choropleth;

        _.world.features.forEach(function (country) {
            var coordinates = country.geometry.coordinates;

            if (choropleth) {
                material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(country.properties.color || 'rgb(2, 20, 37)'),
                    side: THREE.DoubleSide
                });
            } else {
                material = _.material;
            }
            if (coordinates.length === 1) {
                shapePoints(country, coordinates[0]);
            } else {
                coordinates.forEach(function (coord_set) {
                    if (coord_set.length == 1) {
                        shapePoints(country, coord_set[0]);
                    } else {
                        shapePoints(country, coord_set);
                    }
                });
            }
        });
    }

    function create() {
        this.threejsPlugin.addGroup(_.sphereObject);
        loadCountry.call(this);
    }

    function init() {
        var r = this._.proj.scale();
        this._.options.showWorld = true;
        _.sphereObject = this.threejsPlugin.light3d();
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(r, r, r);
        _.sphereObject.name = _.me.name;
    }

    return {
        name: 'world3dThreejs2',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        rotate: function rotate(rtt) {
            _.sphereObject.rotation.y = rtt;
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
            } else {
                return _.world;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
        group: function group() {
            return _.group;
        },
        extrude: function extrude(id, inner, outer) {
            _.group[id] && _.group[id].children.forEach(function (mesh) {
                _extrude(mesh.geometry, inner, outer);
            });
        }
    };
});

var commonPlugins = (function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = { checker: [], ocn: 0, spd: 10, pan: 0, clr: 0 };

    _.checker = [':Shadow:showDropShadow', ':Ocean:showOcean', ':Graticule:showGraticule', ':Land:showLand', ':Country:showCountries', ':Lakes:showLakes', ':Transparent:transparent', ':Canvas:showCanvas', ':Spin:spin'].map(function (d) {
        return d.split(':');
    });

    function addPlugins() {
        var _this2 = this;

        var r = this.register;
        var p = earthjs.plugins;
        r(p.mousePlugin());
        r(p.autorotatePlugin());
        r(p.dropShadowSvg());
        r(p.oceanSvg());
        r(p.canvasPlugin());
        r(p.graticuleCanvas());
        r(p.worldCanvas(worldUrl));
        this._.options.transparent = true;
        this.canvasPlugin.selectAll('.ej-canvas');
        this.graticuleCanvas.drawTo([1]);
        this.worldCanvas.drawTo([0]);

        _.options = this._.options;
        _.buttonClick = function (str) {
            var arr = str.split(':'),
                key = arr[2],
                resultx = {},
                options = _this2._.options;
            options[key] = !options[key];
            resultx[key] = options[key];
            if (key == 'transparent') {
                if (options.transparentGraticule || options.transparentLand) {
                    resultx.transparent = false;
                }
                resultx.transparentGraticule = false;
                resultx.transparentLand = false;
            } else if (key == 'showCountries' || key == 'showLakes') {
                resultx.showLand = true;
            } else if (key == 'transparentGraticule' || key == 'transparentLand') {
                if (options.transparent) {
                    resultx.transparentGraticule = false;
                    resultx.transparentLand = false;
                }
                resultx.transparent = false;
            }
            // this.configPlugin.set(resultx);
        };
    }

    function rangeInput(opt, id, min, max, stp, vl, handler) {
        opt.append('br');
        opt.append('input').attr('id', id).attr('type', 'range').attr('min', min).attr('max', max).attr('step', stp).attr('value', vl).on('input', handler);
    }

    function enableController() {
        var _this3 = this;

        var _this = this;
        var opt = d3.select('.set-options');
        var opt2 = d3.select('.set-options2');
        opt.selectAll('button, input, br').remove();
        opt2.selectAll('button, input, br').remove();
        if (this._.options.showControll) {
            opt.selectAll('button').data(_.checker).enter().append('button').text(function (d) {
                return d[1];
            }).on('click', function (d) {
                return _.buttonClick.call(_this3, d.join(':'));
            });
            rangeInput(opt2, 'pan', 0, 400, 1, _.pan, function () {
                _.pan = +this.value;
                for (var i = 1; i < nodes.length; i++) {
                    nodes[i].style.left = _.pan * i + 'px';
                }
            });
            rangeInput(opt2, 'ocn', 0, 20, 1, _.ocn, function () {
                _.ocn = this.value;_this.oceanSvg.scale(-_.ocn);
            });
            rangeInput(opt2, 'spd', 10, 200, 10, _.spd, function () {
                _.spd = this.value;_this.autorotatePlugin.speed(_.spd);
            });
            var nodes = d3.selectAll('.ea-layer').nodes();
        }
    }

    return {
        name: 'commonPlugins',
        onInit: function onInit(me) {
            _.me = me;
            addPlugins.call(this);
            this._.options.showControll = true;
        },
        onCreate: function onCreate() {
            enableController.call(this);
        },
        addChecker: function addChecker(checker) {
            _.checker.push(checker);
            _.options = this._.options();
            enableController.call(this);
        }
    };
});

var selectCountryMix = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world-110m.json';

    /*eslint no-console: 0 */
    var _ = {};

    function init() {
        var g = this.register(earthjs.plugins.inertiaPlugin()).register(earthjs.plugins.hoverCanvas()).register(earthjs.plugins.clickCanvas()).register(earthjs.plugins.centerCanvas()).register(earthjs.plugins.canvasPlugin()).register(earthjs.plugins.countryCanvas()).register(earthjs.plugins.autorotatePlugin()).register(earthjs.plugins.worldCanvas(worldUrl)).register(earthjs.plugins.threejsPlugin());
        g.canvasPlugin.selectAll('.ej-canvas');
        g._.options.showSelectedCountry = true;
        g._.options.showBorder = false;
        g.worldCanvas.style({ countries: 'rgba(220,91,52,0.2)' });
        g.worldCanvas.ready = function (err, json) {
            g.countryCanvas.data(json);
            g.worldCanvas.data(json);
            g.hoverCanvas.data(json);
            g.clickCanvas.data(json);
        };
        g.centerCanvas.focused(function (event, country) {
            g.autorotatePlugin.stop();
            if (event.metaKey) {
                var arr = g.worldCanvas.selectedCountries().concat(country);
                g.worldCanvas.selectedCountries(arr);
            } else {
                g.worldCanvas.selectedCountries([country]);
            }
            // console.log(country);
        });
    }

    return {
        name: 'selectCountryMix',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        region: function region(arr, centeroid) {
            var g = this;
            var reg = g.worldCanvas.countries().filter(function (x) {
                return arr.indexOf(x.id) > -1;
            });
            g.worldCanvas.selectedCountries(reg);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        },
        multiRegion: function multiRegion(mregion, centeroid) {
            var reg = [];
            var g = this;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var obj = _step.value;

                    var arr = g.worldCanvas.countries().filter(function (x) {
                        var bool = obj.countries.indexOf(x.id) > -1;
                        if (bool) x.color = obj.color;
                        return bool;
                    });
                    reg = reg.concat(arr);
                };

                for (var _iterator = mregion[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            g.worldCanvas.selectedCountries(reg, true);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        }
    };
});

var selectCountryMix2 = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world-110m.json';
    var worldImg = arguments[1];

    /*eslint no-console: 0 */
    var _ = {};

    function init() {
        var g = this.register(earthjs.plugins.worldJson(worldUrl)).register(earthjs.plugins.inertiaPlugin()).register(earthjs.plugins.hoverCanvas()).register(earthjs.plugins.clickCanvas()).register(earthjs.plugins.centerCanvas()).register(earthjs.plugins.countryCanvas()).register(earthjs.plugins.threejsPlugin()).register(earthjs.plugins.autorotatePlugin());
        if (worldImg) {
            g.register(earthjs.plugins.imageThreejs(worldImg));
        }
        g.register(earthjs.plugins.canvasThreejs());
        g._.options.showSelectedCountry = true;
        g._.options.showBorder = false;
        g.canvasThreejs.style({ countries: 'rgba(220,91,52,0.5)' });
        g.centerCanvas.focused(function (event, country) {
            g.autorotatePlugin.stop();
            if (event.metaKey) {
                var arr = g.canvasThreejs.selectedCountries().concat(country);
                g.canvasThreejs.selectedCountries(arr);
            } else {
                g.canvasThreejs.selectedCountries([country]);
            }
            g.canvasThreejs.refresh();
            // console.log(country);
        });
    }

    return {
        name: 'selectCountryMix2',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        region: function region(arr, centeroid) {
            var g = this;
            var reg = g.canvasThreejs.countries().filter(function (x) {
                return arr.indexOf(x.id) > -1;
            });
            g.canvasThreejs.selectedCountries(reg);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        },
        multiRegion: function multiRegion(mregion, centeroid) {
            var reg = [];
            var g = this;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var obj = _step.value;

                    var arr = g.canvasThreejs.countries().filter(function (x) {
                        var bool = obj.countries.indexOf(x.id) > -1;
                        if (bool) x.color = obj.color;
                        return bool;
                    });
                    reg = reg.concat(arr);
                };

                for (var _iterator = mregion[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            g.canvasThreejs.selectedCountries(reg, true);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        }
    };
});

earthjs$2.plugins = {
    baseCsv: baseCsv,
    baseGeoJson: baseGeoJson,
    worldJson: worldJson,
    world3dJson: world3dJson,
    choroplethCsv: choroplethCsv,
    countryNamesCsv: countryNamesCsv,

    colorScale: colorScale,

    dotRegion: dotRegion,
    hoverCanvas: hoverCanvas,
    clickCanvas: clickCanvas,
    mousePlugin: mousePlugin,
    canvasPlugin: canvasPlugin,
    inertiaPlugin: inertiaPlugin,
    countryCanvas: countryCanvas,
    threejsPlugin: threejsPlugin,
    dblClickCanvas: dblClickCanvas,
    autorotatePlugin: autorotatePlugin,

    oceanSvg: oceanSvg,
    sphereSvg: sphereSvg,
    zoomPlugin: zoomPlugin,
    fauxGlobeSvg: fauxGlobeSvg,
    graticuleSvg: graticuleSvg,
    dropShadowSvg: dropShadowSvg,
    dotTooltipSvg: dotTooltipSvg,
    dotSelectCanvas: dotSelectCanvas,
    graticuleCanvas: graticuleCanvas,
    dotTooltipCanvas: dotTooltipCanvas,
    countrySelectCanvas: countrySelectCanvas,
    countryTooltipCanvas: countryTooltipCanvas,
    countryTooltipSvg: countryTooltipSvg,
    barTooltipSvg: barTooltipSvg,
    worldCanvas: worldCanvas,
    centerSvg: centerSvg,
    placesSvg: placesSvg,
    worldSvg: worldSvg,
    barSvg: barSvg,
    mapSvg: mapSvg,
    haloSvg: haloSvg,
    dotsSvg: dotsSvg,
    pingsSvg: pingsSvg,
    pinCanvas: pinCanvas,
    dotsCanvas: dotsCanvas,
    pingsCanvas: pingsCanvas,
    centerCanvas: centerCanvas,
    flattenSvg: flattenSvg,

    barThreejs: barThreejs,
    hmapThreejs: hmapThreejs,
    dotsThreejs: dotsThreejs,
    dotsCThreejs: dotsCThreejs,
    iconsThreejs: iconsThreejs,
    canvasThreejs: canvasThreejs,
    pointsThreejs: pointsThreejs,
    textureThreejs: textureThreejs,
    graticuleThreejs: graticuleThreejs,
    flightLineThreejs: flightLineThreejs,
    oceanThreejs: oceanThreejs,
    imageThreejs: imageThreejs,
    inertiaThreejs: inertiaThreejs,
    worldThreejs: worldThreejs,
    globeThreejs: globeThreejs,
    sphereThreejs: sphereThreejs,
    world3dThreejs: world3dThreejs,
    world3dThreejs2: world3dThreejs2,

    commonPlugins: commonPlugins,
    selectCountryMix: selectCountryMix,
    selectCountryMix2: selectCountryMix2
};

return earthjs$2;

}());
//# sourceMappingURL=earthjs.js.map
