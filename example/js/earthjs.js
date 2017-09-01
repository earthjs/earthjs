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
        selector: '#earth-js',
        rotate: [130, -33, -11],
        transparent: false
    }, options);
    var _ = {
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
        recreateSvgOrCanvas: function recreateSvgOrCanvas() {
            _.onCreateVals.forEach(function (fn) {
                fn.call(globe);
            });
            return globe;
        }
    };
    var drag = false;
    var svg = d3.selectAll(options.selector);
    var width = svg.attr('width'),
        height = svg.attr('height');
    if (!width || !height) {
        width = options.width || 700;
        height = options.height || 500;
        svg.attr('width', width).attr('height', height);
    }
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
            if (fn && _.promeses.length > 0) {
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
                    fn.call(globe);
                });
            } else if (arguments.length === 0) {
                return _.loadingData;
            }
        },
        register: function register(obj, name) {
            var ar = { name: name || obj.name };
            globe[ar.name] = ar;
            Object.keys(obj).forEach(function (fn) {
                if (['urls', 'onReady', 'onInit', 'onCreate', 'onRefresh', 'onResize', 'onInterval'].indexOf(fn) === -1) {
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
        earths = twinEarth || [];
        _.recreateSvgOrCanvas();
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

        var start1 = 0;
        var start2 = 0;
        function step(timestamp) {
            if (timestamp - start1 > intervalTicker) {
                start1 = timestamp;
                if (!_.loadingData) {
                    interval.call(globe, timestamp);
                    if (timestamp - start2 > intervalTicker + 30) {
                        start2 = timestamp;
                        earths.forEach(function (p) {
                            p._.interval.call(p, timestamp);
                        });
                    }
                }
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
        _.onIntervalVals.forEach(function (fn) {
            fn.call(globe, t);
        });
        return globe;
    };

    __.refresh = function (filter) {
        if (filter) {
            var keys = filter ? _.onRefreshKeys.filter(function (d) {
                return filter.test(d);
            }) : _.onRefreshKeys;
            keys.forEach(function (fn) {
                _.onRefresh[fn].call(globe);
            });
        } else {
            _.onRefreshVals.forEach(function (fn) {
                fn.call(globe);
            });
        }
        return globe;
    };

    __.resize = function () {
        _.onResizeVals.forEach(function (fn) {
            fn.call(globe);
        });
        return globe;
    };

    __.orthoGraphic = function () {
        var r = __.options.rotate;
        if (typeof r === 'number') {
            __.options.rotate = [r, -33, -11];
        }
        var scale = __.options.scale;

        if (!scale) {
            scale = __.options.width / 3.5;
        }
        return d3.geoOrthographic().rotate(__.options.rotate).translate(__.center).precision(0.1).clipAngle(90).scale(scale);
    };

    __.proj = __.orthoGraphic();
    __.path = d3.geoPath().projection(__.proj);
    return globe;
    //----------------------------------------
    function qEvent(obj, qname, name) {
        if (obj[qname]) {
            _[qname][name || obj.name] = obj[qname];
            _[qname + 'Keys'] = Object.keys(_[qname]);
            _[qname + 'Vals'] = _[qname + 'Keys'].map(function (k) {
                return _[qname][k];
            });
        }
    }
};
if (window.d3 === undefined) {
    window.d3 = {};
}
window.d3.earthjs = earthjs$2;

var baseCsv = (function (csvUrl) {
    /*eslint no-console: 0 */
    var _ = { data: null };

    return {
        name: 'baseCsv',
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
                _.lakes.features = topojson.feature(_data, _data.objects.ne_110m_lakes).features;
                _.countries.features = topojson.feature(_data, _data.objects.countries).features;
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
        }
    };
});

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var choroplethCsv = (function (csvUrl) {
    /*eslint no-console: 0 */
    var _ = { choropleth: null, color: null };

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
                _.choropleth = _data;
            } else {
                return _.choropleth;
            }
        },
        mergeData: function mergeData(json, arr) {
            var cn = _.choropleth;
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
        },

        // https://github.com/d3/d3-scale-chromatic
        colorize: function colorize(key) {
            var scheme = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'schemeReds';

            var arr = _.choropleth.map(function (x) {
                return +x[key];
            });
            arr = [].concat(toConsumableArray(new Set(arr)));
            _.min = d3.min(arr);
            _.max = d3.max(arr);
            var c = d3[scheme] || d3.schemeReds;
            var x = d3.scaleLinear().domain([1, 10]).rangeRound([_.min, _.max]);
            var color = d3.scaleThreshold().domain(d3.range(2, 10)).range(c[9]);
            _.choropleth.forEach(function (obj) {
                obj.color = color(x(+obj[key]));
            });
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
        mouse: null,
        country: null,
        ocountry: null,
        countries: null,
        onCircle: {},
        onCircleVals: [],
        onCountry: {},
        onCountryVals: []
    };

    function init() {
        this._.options.showSelectedCountry = false;
        if (this.worldCanvas) {
            var world = this.worldCanvas.data();
            if (world) {
                _.world = world;
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        var __ = this._;
        var _this = this;
        var mouseMoveHandler = function mouseMoveHandler() {
            var _this2 = this;

            var event = d3.event;
            if (__.drag || !event) {
                return;
            }
            if (event.sourceEvent) {
                event = event.sourceEvent;
            }
            var mouse = [event.clientX, event.clientY]; //d3.mouse(this);
            var pos = __.proj.invert(d3.mouse(this));
            _.pos = pos;
            _.dot = null;
            _.mouse = mouse;
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
        __.svg.on('mousemove', mouseMoveHandler);
        if (this.mousePlugin) {
            this.mousePlugin.onDrag({
                hoverCanvas: mouseMoveHandler
            });
        }
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
            init.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
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
        if (this.mousePlugin) {
            this.mousePlugin.onClick({
                clickCanvas: mouseClickHandler
            });
        }
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
                _.me.allData(this.worldJson.allData());
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
    var _ = { svg: null, q: null, sync: [], mouse: null, wait: null,
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
    if (zoomScale === undefined) {
        zoomScale = [0, 50000];
    }

    function onclick() {
        _.onClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
        // console.log('onClick');
    }

    function ondblclick() {
        _.onDblClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
        // console.log('onDblClick');
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
            v.call(_this, _.mouse);
        });
    }

    function init() {
        var __ = this._;
        var versor = __.versor;
        var s0 = __.proj.scale();
        var wh = [__.options.width, __.options.height];

        _.svg.call(d3.drag().on('start', dragstarted).on('end', dragsended).on('drag', dragged));

        _.svg.call(d3.zoom().on('zoom', zoom).scaleExtent([0.1, 160]).translateExtent([[0, 0], wh]));

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

        function dragstarted() {
            var _this2 = this;

            var mouse = d3.mouse(this);
            v0 = versor.cartesian(__.proj.invert(mouse));
            r0 = __.proj.rotate();
            q0 = versor(r0);
            __.drag = null;
            _.onDragStartVals.forEach(function (v) {
                return v.call(_this2, mouse);
            });
            _.onDragVals.forEach(function (v) {
                return v.call(_this2, mouse);
            });
            __.refresh();
            _.mouse = mouse;
            _._this = this;
            _.t1 = 0;
            _.t2 = 0;
        }

        function dragged() {
            // DOM update must be onInterval!
            __.drag = true;
            _._this = this;
            _.mouse = d3.mouse(this);
            !intervalDrag && drag(__);
            // _.t1+=1; // twice call compare to onInterval
        }

        function dragsended() {
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
                    _.wait = window.setTimeout(function () {
                        if (_.wait) {
                            _.wait = false;
                        }
                    }, 250);
                }
            } else if (drag) {
                r(__);
                __.rotate(_.r);
                _.onDragVals.forEach(function (v) {
                    return v.call(_._this, _.mouse);
                });
                _.sync.forEach(function (g) {
                    return rotate.call(g, _.r);
                });
            }
            _.onDragEndVals.forEach(function (v) {
                return v.call(_this3, _.mouse);
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
            var __ = this._;
            _.svg = __.svg;
            init.call(this);
        },
        onInterval: function onInterval() {
            interval.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.call(d3.zoom().on('zoom start end', null));
                _.svg.call(d3.drag().on('start', null).on('end', null).on('drag', null));
                _.svg = d3.selectAll(q);
                init.call(this);
            }
            return _.svg;
        },
        sync: function sync(arr) {
            _.sync = arr;
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

var configPlugin = (function () {
    /*eslint no-console: 0 */
    return {
        name: 'configPlugin',
        set: function set(newOpt) {
            if (newOpt) {
                Object.assign(this._.options, newOpt);
                if (newOpt.spin !== undefined) {
                    var rotate = this.autorotatePlugin;
                    newOpt.spin ? rotate.start() : rotate.stop();
                }
                this.create();
            }
            return Object.assign({}, this._.options);
        }
    };
});

// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
var canvasPlugin = (function () {
    /*eslint no-console: 0 */
    var _ = {
        canvas: null,
        path: null,
        q: null
    };

    function init() {
        var __ = this._;
        __.options.showCanvas = true;
        _.path = d3.geoPath().projection(__.proj);
    }

    function create() {
        var __ = this._;
        if (__.options.showCanvas) {
            if (!_.canvas) {
                var fObject = __.svg.append('g').attr('class', 'canvas').append('foreignObject').attr('x', 0).attr('y', 0).attr('width', __.options.width).attr('height', __.options.height);
                var fBody = fObject.append('xhtml:body').style('margin', '0px').style('padding', '0px').style('background-color', 'none').style('width', __.options.width + 'px').style('height', __.options.height + 'px');
                _.canvas = fBody.append('canvas');
            }
            _.canvas.attr('x', 0).attr('y', 0).attr('width', __.options.width).attr('height', __.options.height);
        }
        if (_.canvas) {
            refresh.call(this);
        }
    }

    function refresh() {
        var _$options = this._.options,
            width = _$options.width,
            height = _$options.height;

        _.canvas.each(function () {
            this.getContext('2d').clearRect(0, 0, width, height);
        });
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
                _.me.allData(this.worldJson.allData());
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
var threejsPlugin = (function () {
    var threejs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'three-js';

    /*eslint no-console: 0 */
    var _ = { renderer: null, scene: null, camera: null };
    var SCALE = void 0;

    // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
    function _vertex(point) {
        var lambda = point[0] * Math.PI / 180,
            phi = point[1] * Math.PI / 180,
            cosPhi = Math.cos(phi);
        return new THREE.Vector3(SCALE * cosPhi * Math.cos(lambda), SCALE * Math.sin(phi), -SCALE * cosPhi * Math.sin(lambda));
    }

    // Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
    function _wireframe(multilinestring, material) {
        var geometry = new THREE.Geometry();
        multilinestring.coordinates.forEach(function (line) {
            d3.pairs(line.map(_vertex), function (a, b) {
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

        var container = document.getElementById(threejs);
        _.scale = d3.scaleLinear().domain([0, SCALE]).range([0, 1]);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 30000);
        _.scene = new THREE.Scene();
        _.group = new THREE.Group();
        _.camera.position.z = 3010; // (higher than RADIUS + size of the bubble)
        _.scene.add(_.group);
        this._.camera = _.camera;

        _.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: container });
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        _.renderer.sortObjects = false;
        this.renderThree = _renderThree;
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
        if (!obj) {
            obj = _.group;
        }
        var __ = this._;
        var rt = __.proj.rotate();
        rt[0] -= 90;
        var q1 = __.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        obj.setRotationFromQuaternion(q2);
        _renderThree.call(this);
    }

    var renderThreeX = null;
    function _renderThree() {
        var direct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (direct) {
            _.renderer.render(_.scene, _.camera);
        } else if (renderThreeX === null) {
            renderThreeX = setTimeout(function () {
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
            _renderThree.call(this);
        },
        onRefresh: function onRefresh() {
            _rotate.call(this);
        },
        onResize: function onResize() {
            _scale.call(this);
        },
        group: function group() {
            return _.group;
        },
        addGroup: function addGroup(obj) {
            _.group.add(obj);
        },
        scale: function scale(obj) {
            _scale.call(this, obj);
        },
        rotate: function rotate(obj) {
            _rotate.call(this, obj);
        },
        vertex: function vertex(point) {
            return _vertex(point);
        },
        wireframe: function wireframe(multilinestring, material) {
            return _wireframe(multilinestring, material);
        },
        renderThree: function renderThree() {
            _renderThree.call(this);
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
        if (this.mousePlugin) {
            this.mousePlugin.onDblClick({
                dblClickCanvas: mouseDblClickHandler
            });
        }
    }

    return {
        name: 'dblClickCanvas',
        onInit: function onInit(me) {
            _.me = me;
            initmouseClickHandler.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
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
            if (this._.options.spin && !this._.drag) {
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
        start: function start() {
            this._.options.spin = true;
        },
        stop: function stop() {
            this._.options.spin = false;
        },
        sync: function sync(arr) {
            _.sync = arr;
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
        _.barProjection = __.orthoGraphic();
        _.svg = __.svg;
    }

    function create() {
        var __ = this._;
        svgClipPath.call(this);
        _.svg.selectAll('.bar').remove();
        if (_.bars && __.options.showBars) {
            var gBar = _.svg.append('g').attr('class', 'bar');
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
        _.svg.selectAll('.dot').remove();
        if (_.dataDots && __.options.showDots) {
            var circles = [];
            _.circles.forEach(function (d) {
                circles.push(d.circle);
            });
            $.dots = _.svg.append('g').attr('class', 'dot').selectAll('path').data(circles).enter().append('path');
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
        _.svg.selectAll('.landbg,.land,.lakes,.countries').remove();
        if (__.options.showLand) {
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
                if (!$.worldBg) {
                    svgAddWorldBg();
                }
                __.proj.clipAngle(180);
                $.worldBg.attr('d', __.path);
                __.proj.clipAngle(90);
            } else if ($.worldBg) {
                $.worldBg.remove();
                $.worldBg = null;
            }
            if (__.options.showLand) {
                if (__.options.showCountries) {
                    if (!$.countries) {
                        $.world.remove();
                        $.world = null;
                        svgAddCountries();
                    }
                    $.countries.attr('d', __.path);
                } else {
                    if (!$.world) {
                        $.countries.remove();
                        $.countries = null;
                        svgAddWorld();
                    }
                    $.world.attr('d', __.path);
                }
                if (__.options.showLakes) {
                    $.lakes.attr('d', __.path);
                }
            }
        }
    }

    function svgAddWorldBg() {
        $.worldBg = _.svg.append('g').attr('class', 'landbg').append('path').datum(_.land).attr('fill', 'rgba(119,119,119,0.2)');
    }

    function svgAddWorld() {
        $.world = _.svg.append('g').attr('class', 'land').append('path').datum(_.land);
    }

    function svgAddCountries() {
        $.countries = _.svg.append('g').attr('class', 'countries').selectAll('path').data(_.countries.features).enter().append('path').attr('id', function (d) {
            return 'x' + d.id;
        });
    }

    function svgAddLakes() {
        $.lakes = _.svg.append('g').attr('class', 'lakes').append('path').datum(_.lakes);
    }

    return {
        name: 'worldSvg',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            var __ = this._;
            var options = __.options;
            options.showLand = true;
            options.showLakes = true;
            options.showCountries = true;
            options.transparentLand = false;
            _.svgAddCountries = svgAddCountries;
            _.svgAddWorldBg = svgAddWorldBg;
            _.svgAddLakes = svgAddLakes;
            _.svgAddWorld = svgAddWorld;
            _.svg = __.svg;
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
                _.lakes.features = topojson.feature(_data, _data.objects.ne_110m_lakes).features;
                _.countries.features = topojson.feature(_data, _data.objects.countries).features;
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
            return $.world;
        },
        $lakes: function $lakes() {
            return $.lakes;
        },
        $countries: function $countries() {
            return $.countries;
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
        _.svg.selectAll('.pings').remove();
        if (_.dataPings && this._.options.showPings) {
            var g = _.svg.append('g').attr('class', 'pings');
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
    var color = {
        0: ['rgba(221, 221, 255, 0.6)', 'rgba(153, 170, 187,0.8)'],
        1: ['rgba(159, 240, 232, 0.6)', 'rgba(  5, 242, 219,0.8)'],
        2: ['rgba(152, 234, 242, 0.6)', 'rgba(  5, 219, 242,0.8)'],
        3: ['rgba(114, 162, 181, 0.6)', 'rgba(  4, 138, 191,0.8)'],
        4: ['rgba( 96, 123, 148, 0.6)', 'rgba( 10,  93, 166,0.8)'],
        5: ['rgba( 87, 102, 131, 0.6)', 'rgba(  8,  52, 140,0.8)'] };
    var _ = { svg: null, q: null, scale: 0, oceanColor: 0 };
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
        _.svg.selectAll('#ocean,.ocean').remove();
        if (this._.options.showOcean) {
            var c = _.oceanColor;
            var ocean_fill = this.$slc.defs.append('radialGradient').attr('id', 'ocean').attr('cx', '75%').attr('cy', '25%');
            if (typeof c === 'number') {
                c = color[c];
                ocean_fill.append('stop').attr('offset', '5%').attr('stop-color', c[0]);
            } else if (typeof c === 'string') {
                c = [c, c];
            }
            ocean_fill.append('stop').attr('offset', '100%').attr('stop-color', c[1]);
            $.ocean = _.svg.append('g').attr('class', 'ocean').append('circle').attr('cx', this._.center[0]).attr('cy', this._.center[1]).attr('class', 'noclicks');
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

    function init() {
        var __ = this._;
        __.options.showSphere = true;
        _.svg = __.svg;
    }

    function create() {
        _.svg.selectAll('#glow,.sphere').remove();
        if (this._.options.showSphere) {
            this.$slc.defs.nodes()[0].append('\n<filter id=\'glow\'>\n    <feColorMatrix type=\'matrix\'\n        values=\n        \'0 0 0 0   0\n         0 0 0 0.9 0\n         0 0 0 0.9 0\n         0 0 0 1   0\'/>\n    <feGaussianBlur stdDeviation=\'5.5\' result=\'coloredBlur\'/>\n    <feMerge>\n        <feMergeNode in=\'coloredBlur\'/>\n        <feMergeNode in=\'SourceGraphic\'/>\n    </feMerge>\n</filter>\n');
            $.sphere = _.svg.append('g').attr('class', 'sphere').append('circle').attr('cx', this._.center[0]).attr('cy', this._.center[1]).attr('class', 'noclicks').attr('filter', 'url(#glow)');
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

    function init() {
        var __ = this._;
        __.options.showPlaces = true;
        _.svg = __.svg;
    }

    function create() {
        _.svg.selectAll('.points,.labels').remove();
        if (_.places) {
            if (this._.options.showPlaces) {
                svgAddPlacePoints.call(this);
                svgAddPlaceLabels.call(this);
                refresh.call(this);
            }
        }
    }

    function svgAddPlacePoints() {
        $.placePoints = _.svg.append('g').attr('class', 'points').selectAll('path').data(_.places.features).enter().append('path').attr('class', 'point');
    }

    function svgAddPlaceLabels() {
        $.placeLabels = _.svg.append('g').attr('class', 'labels').selectAll('text').data(_.places.features).enter().append('text').attr('class', 'label').text(function (d) {
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

    function init() {
        var g1 = this._.proj;
        var g2 = d3.geoEquirectangular().scale(this._.options.width / 6.3).translate(this._.center);
        _.g1 = g1;
        _.g2 = g2;
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
        var px = d3.geoProjection(raw).scale(1);
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
            px.center([(1 - alpha) * ca[0] + alpha * cb[0], (1 - alpha) * ca[1] + alpha * cb[1]]);
            px.translate([(1 - alpha) * ta[0] + alpha * tb[0], (1 - alpha) * ta[1] + alpha * tb[1]]);
            return px;
        };
        animation.alpha(0);
        return px;
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
        toMap: function toMap() {
            var _this2 = this;

            defaultRotate.call(this).on('end', function () {
                var proj = interpolatedProjection(_.g1, _.g2);
                _this2._.path = d3.geoPath().projection(proj);
                animation.call(_this2).on('end', function () {
                    _this2._.options.enableCenter = false;
                });
            });
        },
        toGlobe: function toGlobe() {
            var _this3 = this;

            this._.rotate([0, 0, 0]);
            var proj = interpolatedProjection(_.g2, _.g1);
            this._.path = d3.geoPath().projection(proj);
            animation.call(this).on('end', function () {
                _this3._.path = d3.geoPath().projection(_this3._.proj);
                _this3._.options.enableCenter = true;
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
        _.svg.selectAll('#shading,.shading').remove();
        if (__.options.showGlobeShading) {
            var globe_shading = this.$slc.defs.append('radialGradient').attr('id', 'shading').attr('cx', '50%').attr('cy', '40%');
            globe_shading.append('stop').attr('offset', '50%').attr('stop-color', '#9ab').attr('stop-opacity', '0');
            globe_shading.append('stop').attr('offset', '100%').attr('stop-color', '#3e6184').attr('stop-opacity', '0.3');
            $.globeShading = _.svg.append('g').attr('class', 'shading').append('circle').attr('cx', __.center[0]).attr('cy', __.center[1]).attr('r', __.proj.scale()).attr('class', 'noclicks').style('fill', 'url(#shading)');
        }
    }

    function svgAddGlobeHilight() {
        var __ = this._;
        _.svg.selectAll('#hilight,.hilight').remove();
        if (__.options.showGlobeHilight) {
            var globe_highlight = this.$slc.defs.append('radialGradient').attr('id', 'hilight').attr('cx', '75%').attr('cy', '25%');
            globe_highlight.append('stop').attr('offset', '5%').attr('stop-color', '#ffd').attr('stop-opacity', '0.6');
            globe_highlight.append('stop').attr('offset', '100%').attr('stop-color', '#ba9').attr('stop-opacity', '0.2');
            $.globeHilight = _.svg.append('g').attr('class', 'hilight').append('circle').attr('cx', __.center[0]).attr('cy', __.center[1]).attr('r', __.proj.scale()).attr('class', 'noclicks').style('fill', 'url(#hilight)');
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
        _.svg.selectAll('.graticule').remove();
        if (this._.options.showGraticule) {
            $.graticule = _.svg.append('g').attr('class', 'graticule').append('path').datum(_.graticule).attr('class', 'noclicks');
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
        _.svg.selectAll('#drop_shadow,.drop_shadow').remove();
        if (__.options.showDropShadow) {
            var drop_shadow = this.$slc.defs.append('radialGradient').attr('id', 'drop_shadow').attr('cx', '50%').attr('cy', '50%');
            drop_shadow.append('stop').attr('offset', '20%').attr('stop-color', '#000').attr('stop-opacity', '.5');
            drop_shadow.append('stop').attr('offset', '100%').attr('stop-color', '#000').attr('stop-opacity', '0');
            $.dropShadow = _.svg.append('g').attr('class', 'drop_shadow').append('ellipse').attr('cx', __.center[0]).attr('class', 'noclicks').style('fill', 'url(#drop_shadow)');
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

    function create() {
        var _this = this;
        this.dotsSvg.$dots().on('mouseover', function () {
            if (_this._.options.showBarTooltip) {
                _.visible = true;
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                var i = +this.dataset.index;
                var d = _this.dotsSvg.data().features[i];
                if (_.me.onShow) {
                    d = _.me.onShow.call(this, d, dotTooltip);
                }
                _.me.show(d.properties).style('display', 'block').style('opacity', 1);
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
        show: function show(props) {
            var title = Object.keys(props).map(function (k) {
                return k + ': ' + props[k];
            }).join('<br/>');
            return dotTooltip.html(title);
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

    function create() {
        var _this = this;
        this.barSvg.$bar().on('mouseover', function () {
            if (_this._.options.showBarTooltip) {
                _.visible = true;
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                var i = +this.dataset.index;
                var d = _this.barSvg.data().features[i];
                if (_.me.onShow) {
                    d = _.me.onShow.call(this, d, barTooltip);
                }
                _.me.show(d).style('display', 'block').style('opacity', 1);
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
        show: function show(d) {
            var props = d.properties;
            var title = Object.keys(props).map(function (k) {
                return k + ': ' + props[k];
            }).join('<br/>');
            return barTooltip.html(title);
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

    function create() {
        var _this = this;
        this.worldSvg.$countries().on('mouseover', function (d) {
            if (_this._.options.showCountryTooltip) {
                _.show = true;
                var country = countryName(d);
                refresh().style('display', 'block').style('opacity', 1).text(country.name);
            }
        }).on('mouseout', function () {
            _.show = false;
            countryTooltip.style('opacity', 0).style('display', 'none');
        }).on('mousemove', function () {
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
                refresh(this.mousePlugin.mouse());
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
                _.dataPin.features.forEach(function (d) {
                    var coordinates = d.geometry.coordinates;
                    if (d3.geoDistance(coordinates, center) <= 1.57) {
                        var a = __.path.centroid(d);
                        context.drawImage(_.image, a[0] - _.pX, a[1] - _.pY, _.wh[0], _.wh[1]);
                    }
                });
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
    var color = {
        0: 'rgba(117, 87, 57, 0.6)',
        1: 'rgba(138, 96, 56, 0.6)',
        2: 'rgba(140,104, 63, 0.6)',
        3: 'rgba(149,114, 74, 0.6)',
        4: 'rgba(153,126, 87, 0.6)',
        5: 'rgba(155,141,115, 0.6)' };
    var _ = {
        style: {},
        options: {},
        landColor: 0,
        drawTo: null,
        world: null,
        land: null,
        lakes: { type: 'FeatureCollection', features: [] },
        selected: { type: 'FeatureCollection', features: [] },
        countries: { type: 'FeatureCollection', features: [] }
    };

    function create() {
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
                    canvasAddCountries.call(this);
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
                    this.canvasPlugin.render(function (context, path) {
                        context.beginPath();
                        path(_.selected);
                        context.fillStyle = _.style.selected || 'rgba(87, 255, 99, 0.4)';
                        context.fill();
                    }, _.drawTo, _.options);
                }

                var _hoverCanvas$states = this.hoverCanvas.states(),
                    country = _hoverCanvas$states.country;

                if (country && !_.selected.features.find(function (obj) {
                    return obj.id === country.id;
                })) {
                    this.canvasPlugin.render(function (context, path) {
                        context.beginPath();
                        path(country);
                        context.fillStyle = _.style.hover || 'rgba(117, 0, 0, 0.4)';
                        context.fill();
                    }, _.drawTo, _.options);
                }
            }
        }
    }

    function canvasAddWorld() {
        this.canvasPlugin.render(function (context, path) {
            var c = _.landColor;
            context.beginPath();
            path(_.land);
            context.fillStyle = _.style.land || (typeof c === 'number' ? color[c] : c);
            context.fill();
        }, _.drawTo, _.options);
    }

    function canvasAddCountries() {
        var border = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        this.canvasPlugin.render(function (context, path) {
            var c = _.landColor;
            context.beginPath();
            path(_.countries);
            if (!border) {
                context.fillStyle = _.style.countries || _.style.land || (typeof c === 'number' ? color[c] : c);
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
            context.fillStyle = _.style.lakes || 'rgba(80, 87, 97, 0.4)';
            context.fill();
        }, _.drawTo, _.options);
    }

    return {
        name: 'worldCanvas',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
            Object.defineProperty(this._.options, 'landColor', {
                get: function get() {
                    return _.landColor;
                },
                set: function set(x) {
                    _.landColor = x;
                }
            });
        },
        onInit: function onInit(me) {
            _.me = me;
            var options = this._.options;
            options.showLand = true;
            options.showLakes = true;
            options.showBorder = false;
            options.showCountries = true;
            options.transparentLand = false;
            options.landColor = 0;
        },
        onCreate: function onCreate() {
            var _this = this;

            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
            if (this.hoverCanvas) {
                var hover = {};
                hover[_.me.name] = function () {
                    if (!_this._.options.spin) {
                        _this._.refresh();
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
            if (arr) {
                _.selected.features = arr;
            } else {
                return _.selected.features;
            }
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.land = topojson.feature(_data, _data.objects.land);
                _.lakes.features = topojson.feature(_data, _data.objects.ne_110m_lakes).features;
                _.countries.features = topojson.feature(_data, _data.objects.countries).features;
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
                context.lineWidth = 0.4;
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
    var _ = {};
    var dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    function showTooltip(event, data) {
        if (_.me.onShow) {
            data = _.me.onShow.call(this, data, dotTooltip);
        }
        var mouse = [event.clientX, event.clientY];
        _.me.show(data.properties).style('display', 'block').style('opacity', 1).style('left', mouse[0] + 7 + 'px').style('top', mouse[1] - 15 + 'px');
        _.oldData = data;
    }

    function hideTooltip() {
        dotTooltip.style('opacity', 0).style('display', 'none');
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
        },
        show: function show(props) {
            var title = Object.keys(props).map(function (k) {
                return k + ': ' + props[k];
            }).join('<br/>');
            return dotTooltip.html(title);
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
    var countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');
    var _ = {};

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

    function showTooltip(event, country) {
        refresh([event.clientX, event.clientY]).style('display', 'block').style('opacity', 1).text(country.name);
    }

    function hideTooltip() {
        countryTooltip.style('opacity', 0).style('display', 'none');
    }

    function init() {
        var _this = this;

        var toolTipsHandler = function toolTipsHandler(event, data) {
            // fn with  current context
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
        toolTipsHandler.tooltips = true;
        this.hoverCanvas.onCountry({
            countryTooltipCanvas: toolTipsHandler
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
                refresh(this.mousePlugin.mouse());
            }
        },
        show: function show(props) {
            var title = Object.keys(props).map(function (k) {
                return k + ': ' + props[k];
            }).join('<br/>');
            return countryTooltip.html(title);
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
    var _ = { sphereObject: null, data: null };
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

    function init() {
        this._.options.showBars = true;
    }

    function create() {
        var o = this._.options;
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
        }
        _.sphereObject.visible = o.showBars;
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
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showBars;
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
        }
        _.sphereObject.visible = this._.options.showHmap;
        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    function refresh() {
        _.heatmap.update();
        _.heatmap.display();
        _.sphereObject.visible = this._.options.showHmap;
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
var dotsThreejs = (function (urlJson) {
    /*eslint no-console: 0 */
    var _ = { dataDots: null };

    function init() {
        this._.options.showDots = true;
    }

    function createDot(feature) {
        if (feature) {
            var tj = this.threejsPlugin;
            // var dc = [-77.0369, 38.9072];
            // var position = tj.vertex(feature ? feature.geometry.coordinates : dc);
            var position = tj.vertex(feature.geometry.coordinates);
            var material = new THREE.SpriteMaterial({ color: 0x0000ff });
            var dot = new THREE.Sprite(material);
            dot.position.set(position.x, position.y, position.z);
            return dot;
        }
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.dots) {
            create1.call(this);
        }
        _.dots.visible = this._.options.showDots;
        tj.addGroup(_.dots);
    }

    function create1() {
        var _this = this;
        _.dots = new THREE.Group();
        _.dataDots.features.forEach(function (d) {
            var dot = createDot.call(_this, d);
            dot && _.dots.add(dot);
        });
    }

    return {
        name: 'dotsThreejs',
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
        onRefresh: function onRefresh() {
            _.dots.visible = this._.options.showDots;
        },
        data: function data(_data) {
            if (_data) {
                _.dataDots = _data;
            } else {
                return _.dataDots;
            }
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
            _.sphereObject.visible = this._.options.showIcons;
        }
        tj.addGroup(_.sphereObject);
    }

    function init() {
        var _this = this;

        var tj = this.threejsPlugin;
        this._.options.showIcons = true;
        var loader = new THREE.TextureLoader();
        loader.load(iconUrl, function (map) {
            _.material = new THREE.MeshPhongMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                map: map
            });
            if (_.data && !_.loaded) {
                loadIcons.call(_this);
                tj.rotate();
            }
        });
    }

    function create() {
        if (_.material && !_.loaded) {
            loadIcons.call(this);
        }
    }

    function refresh() {
        if (_.sphereObject) {
            _.sphereObject.visible = this._.options.showIcons;
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
        onRefresh: function onRefresh() {
            refresh.call(this);
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
        style: {},
        onDraw: {},
        onDrawVals: [],
        selected: {
            type: 'FeatureCollection',
            features: []
        },
        material: new THREE.MeshBasicMaterial({ transparent: false })
    };

    function init() {
        var width = height * 2;
        var o = this._.options;
        o.showLand = true;
        o.showTjCanvas = true;
        o.transparentLand = false;
        var SCALE = this._.proj.scale();
        _.geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        _.newCanvas = document.createElement('canvas');
        _.newContext = _.newCanvas.getContext('2d');

        _.texture = new THREE.Texture(_.newCanvas);
        _.material.map = _.texture;

        _.canvas = d3.select('body').append('canvas').style('position', 'absolute').style('display', 'none').style('top', '450px').attr('width', width).attr('height', height).attr('id', 'tjs-canvas').node();
        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().scale(width / scw).translate([width / 2, height / 2]);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
        _.path2 = d3.geoPath().projection(_.proj).context(_.newContext);

        //set dimensions
        _.newCanvas.width = _.canvas.width;
        _.newCanvas.height = _.canvas.height;
    }

    function create() {
        var _this = this;

        var o = this._.options;
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            resize.call(this);
            _.sphereObject = new THREE.Mesh(_.geometry, _.material);
        }
        _.material.transparent = o.transparent || o.transparentLand;
        _.onDrawVals.forEach(function (v) {
            v.call(_this, _.newContext, _.path);
        });

        _.sphereObject.visible = o.showTjCanvas;
        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    function choropleth() {
        var o = this._.options;
        if (o.choropleth) {
            var i = _.countries.features.length;
            while (i--) {
                var obj = _.countries.features[i];
                _.context.beginPath();
                _.path(obj);
                _.context.fillStyle = obj.color || '#8f9fc1'; //"rgb(" + (i+1) + ",0,0)";
                _.context.fill();
            }
            return true;
        } else {
            _.path(_.countries);
            _.context.fillStyle = '#8f9fc1'; // '#00ff00';
            _.context.fill();
            return false;
        }
    }

    // stroke adjustment when zooming
    var scale10 = d3.scaleLinear().domain([30, 450]).range([10, 2]);
    function resize() {
        var o = this._.options;
        if (_.style.ocean) {
            _.context.fillStyle = _.style.ocean;
            _.context.fillRect(0, 0, _.canvas.width, _.canvas.height);
        } else {
            _.context.clearRect(0, 0, _.canvas.width, _.canvas.height);
        }
        var crp = true;
        _.context.beginPath();
        if (!o.showBorder) {
            crp = choropleth.call(this);
        }
        if (o.showBorder || o.showBorder === undefined) {
            var sc = scale10(this._.proj.scale());
            if (sc < 1) sc = 1;
            if (crp) {
                _.path(_.countries);
            }
            _.context.lineWidth = sc;
            _.context.strokeStyle = _.style.countries || 'rgb(239, 237, 234)'; //'rgb(0, 37, 34)';
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
                _.newContext.fillStyle = _.style.selected || 'rgba(255, 235, 0, 0.4)'; // 'rgba(87, 255, 99, 0.4)';
                _.newContext.fill();
            }

            var _hoverCanvas$states = this.hoverCanvas.states(),
                country = _hoverCanvas$states.country;

            if (country && !_.selected.features.find(function (obj) {
                return obj.id === country.id;
            })) {
                _.newContext.beginPath();
                _.path2(country);
                _.newContext.fillStyle = _.style.hover || 'rgba(117, 0, 0, 0.4)'; //'rgb(137, 138, 34)';
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
                _.me.allData(this.worldJson.allData());
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
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        refresh: function refresh() {
            _.refresh = true;
            _refresh.call(this);
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
    var geometry;

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
        var width = __.options.width;
        var height = __.options.height;
        if (!_.sphereObject) {
            _.context.fillStyle = 'white';
            _.context.fillRect(0, 0, width, height);
            _.context.beginPath();
            _.path(datumGraticule);
            _.context.lineWidth = 0.4;
            _.context.strokeStyle = 'rgba(119,119,119,0.6)';
            _.context.stroke();
            _.sphereObject = new THREE.Mesh(geometry, material);
            _.sphereObject.visible = this._.options.showLand;
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
        onRefresh: function onRefresh() {
            _.graticule.visible = this._.options.showDrawing;
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
        this._.options.showGraticule = true;
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
            var material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
            _.sphereObject = tj.wireframe(_.graticule10, material); //0x800000
            _.sphereObject.visible = this._.options.showGraticule;
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
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showGraticule;
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// http://callumprentice.github.io/apps/flight_stream/index.html
var flightLineThreejs = (function (jsonUrl) {
    var num_decorators = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;

    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null
    };

    var vertexshader = "\n        uniform vec2 uvScale;\n        varying vec2 vUv;\n\n        void main() {\n            vUv = uv;\n            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n            gl_Position = projectionMatrix * mvPosition;\n        }";

    var fragmentshader = "\n        uniform float time;\n        uniform vec2 resolution;\n        varying vec2 vUv;\n\n        void main(void) {\n            vec2 position = vUv / resolution.xy;\n            float green = abs(sin(position.x * position.y + time / 5.0)) + 0.5;\n            float red   = abs(sin(position.x * position.y + time / 4.0)) + 0.1;\n            float blue  = abs(sin(position.x * position.y + time / 3.0)) + 0.2;\n            gl_FragColor= vec4(red, green, blue, 1.0);\n        }";

    // get the point in space on surface of sphere radius radius from lat lng
    // lat and lng are in degrees
    function latlngPosFromLatLng(lat, lng, radius) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;
        var x = radius * Math.sin(phi) * Math.cos(theta);
        var y = radius * Math.cos(phi);
        var z = radius * Math.sin(phi) * Math.sin(theta);

        return {
            phi: phi,
            theta: theta,
            x: x,
            y: y,
            z: z
        };
    }

    // convert an angle in degrees to same in radians
    function latlngDeg2rad(n) {
        return n * Math.PI / 180;
    }

    // Find intermediate points on sphere between two lat/lngs
    // lat and lng are in degrees
    // offset goes from 0 (lat/lng1) to 1 (lat/lng2)
    // formula from http://williams.best.vwh.net/avform.htm#Intermediate
    function latlngInterPoint(lat1, lng1, lat2, lng2, offset) {
        lat1 = latlngDeg2rad(lat1);
        lng1 = latlngDeg2rad(lng1);
        lat2 = latlngDeg2rad(lat2);
        lng2 = latlngDeg2rad(lng2);

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

    var uniforms = {
        time: {
            type: "f",
            value: 1.0
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2()
        }
    };

    function addTrack(start_lat, start_lng, end_lat, end_lng, radius, group) {
        var num_control_points = 10;
        var max_altitude = Math.random() * 120;

        var points = [];
        for (var i = 0; i < num_control_points + 1; i++) {
            var arc_angle = i * 180.0 / num_control_points;
            var arc_radius = radius + Math.sin(latlngDeg2rad(arc_angle)) * max_altitude;
            var latlng = latlngInterPoint(start_lat, start_lng, end_lat, end_lng, i / num_control_points);
            var pos = latlngPosFromLatLng(latlng.lat, latlng.lng, arc_radius);

            points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
        }
        var spline = new THREE.CatmullRomCurve3(points);

        var circleRadius = 0.5;
        var shape = new THREE.Shape();
        shape.moveTo(0, circleRadius);
        shape.quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0);
        shape.quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius);
        shape.quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0);
        shape.quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius);
        var circle_extrude = new THREE.ExtrudeGeometry(shape, {
            bevelEnabled: false,
            extrudePath: spline,
            amount: 10,
            steps: 64
        });

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexshader,
            fragmentShader: fragmentshader
        });

        uniforms.resolution.value.x = 100;
        uniforms.resolution.value.y = 100;

        var mesh = new THREE.Mesh(circle_extrude, material);
        group.add(mesh);
    }

    function init() {
        this._.options.showFlightLine = true;
    }

    function create() {
        var o = this._.options;
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var group = new THREE.Group();
            var SCALE = this._.proj.scale();

            for (var i = 0; i < num_decorators; ++i) {
                var start_index = Math.floor(Math.random() * _.data.length) - 1;
                var start_lat = _.data[start_index].lat;
                var start_lng = _.data[start_index].lng;

                var end_index = Math.floor(Math.random() * _.data.length) - 1;
                var end_lat = _.data[end_index].lat;
                var end_lng = _.data[end_index].lng;
                addTrack(start_lat, start_lng, end_lat, end_lng, SCALE, group);
            }
            _.sphereObject = group;
            console.log('done add');
        }
        _.sphereObject.visible = o.showFlightLine;
        tj.addGroup(_.sphereObject);
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
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showFlightLine;
        },
        data: function data(_data) {
            if (_data) {
                _.data = _data;
            } else {
                return _.data;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// http://callumprentice.github.io/apps/flight_stream/index.html
// https://stackoverflow.com/questions/9695687/javascript-converting-colors-numbers-strings-vice-versa
var flightLine2Threejs = (function (jsonUrl, imgUrl, height) {
    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null,
        track_lines_object: null,
        track_points_object: null,
        linewidth: 3,
        texture: null,
        maxVal: 1
    };
    var colorRange = [d3.rgb('#FFAAFF'), d3.rgb("#FF0000")];

    var min_arc_distance = +Infinity;
    var max_arc_distance = -Infinity;
    var cur_arc_distance = 0;
    var point_spacing = 100;
    var point_opacity = 0.8;
    var point_speed = 1.0;
    var point_cache = [];
    var all_tracks = [];

    var PI180 = Math.PI / 180.0;

    var positions = void 0,
        values = void 0,
        colors = void 0,
        sizes = void 0,
        ttl_num_points = 0;
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
            var max_height = Math.random() * (height || _.SCALE) + 0.05;
            for (var i = 0; i < spline_control_points + 1; i++) {
                var arc_angle = i * 180.0 / spline_control_points;
                var arc_radius = radius + Math.sin(arc_angle * PI180) * max_height;
                var latlng = lat_lng_inter_point(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);
                var pos = xyz_from_lat_lng(latlng.lat, latlng.lng, arc_radius);

                points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
            }

            var spline = new THREE.CatmullRomCurve3(points);
            var arc_distance = lat_lng_distance(start_lat, start_lng, end_lat, end_lng, radius);

            var point_positions = [];
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

            var track = {
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
            };
            all_tracks.push(track);
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

    var vertexshader = '\n    attribute float size;\n    attribute vec3 customColor;\n    varying vec3 vColor;\n\n    void main() {\n        vColor = customColor;\n        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n        gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );\n        gl_Position = projectionMatrix * mvPosition;\n    }';

    var fragmentshader = '\n    uniform vec3 color;\n    uniform sampler2D texture;\n    uniform float opacity;\n\n    varying vec3 vColor;\n\n    void main() {\n        gl_FragColor = vec4( color * vColor, opacity );\n        gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );\n    }';

    function generate_point_cloud() {
        positions = new Float32Array(ttl_num_points * 3);
        colors = new Float32Array(ttl_num_points * 3);
        values = new Float32Array(ttl_num_points);
        sizes = new Float32Array(ttl_num_points);

        var index = 0;
        for (var i = 0; i < all_tracks.length; ++i) {
            var _all_tracks$i = all_tracks[i],
                value = _all_tracks$i.value,
                point_positions = _all_tracks$i.point_positions;

            var c = new THREE.Color(0xFFFFFF).setHSL(1 - value / _.maxVal, 0.4, 0.8);
            var pSize = _.point(value || 1);
            for (var j = 0; j < point_positions.length; ++j) {

                positions[3 * index + 0] = 0;
                positions[3 * index + 1] = 0;
                positions[3 * index + 2] = 0;

                colors[3 * index + 0] = c.r;
                colors[3 * index + 1] = c.g;
                colors[3 * index + 2] = c.b;
                values[index] = value || 1;
                sizes[index] = pSize; //_.point_size;

                ++index;
            }
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
        var index = 0;
        var dates = Date.now();
        var i_length = all_tracks.length;
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
                for (var j = 0; j < num_points; j++) {
                    var index3 = 3 * index;
                    positions[index3 + 0] = Infinity;
                    positions[index3 + 1] = Infinity;
                    positions[index3 + 2] = Infinity;
                    index++;
                }
            }
        }
        _.attr_position.needsUpdate = true;
    }

    function fast_get_spline_point(i, t, spline) {
        if (point_cache[i] === undefined) {
            point_cache[i] = [];
        }
        var tc = parseInt(t * 1000);
        var pcache = point_cache[i];
        if (pcache[tc] === undefined) {
            pcache[tc] = spline.getPoint(t);
        }
        return pcache[tc];
    }

    var line_positions;
    var line_opacity = 0.4;
    var curve_points = 24;
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
        var geometry = new THREE.BufferGeometry();
        var total_arr = all_tracks.length * 3 * 2 * curve_points;
        line_positions = new Float32Array(total_arr);
        var colors = new Float32Array(total_arr);
        var _all_tracks = all_tracks,
            length = _all_tracks.length;


        for (var i = 0; i < length; ++i) {
            var _all_tracks$i3 = all_tracks[i],
                spline = _all_tracks$i3.spline,
                color = _all_tracks$i3.color;
            // var {r,g,b} = new THREE.Color(0xffffff).setHSL(i / all_tracks.length, 0.9, 0.8);

            var _ref = new THREE.Color(color),
                r = _ref.r,
                g = _ref.g,
                b = _ref.b;

            for (var j = 0; j < curve_points - 1; ++j) {
                /*eslint no-redeclare:0*/
                var i_curve = (i * curve_points + j) * 6;

                var _spline$getPoint = spline.getPoint(j / (curve_points - 1)),
                    x = _spline$getPoint.x,
                    y = _spline$getPoint.y,
                    z = _spline$getPoint.z;

                line_positions[i_curve + 0] = x;
                line_positions[i_curve + 1] = y;
                line_positions[i_curve + 2] = z;

                var _spline$getPoint2 = spline.getPoint((j + 1) / (curve_points - 1)),
                    x = _spline$getPoint2.x,
                    y = _spline$getPoint2.y,
                    z = _spline$getPoint2.z;

                line_positions[i_curve + 3] = x;
                line_positions[i_curve + 4] = y;
                line_positions[i_curve + 5] = z;

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

    // function update_track_lines() {
    //
    //     for (var i = 0; i < all_tracks.length; ++i) {
    //         var {
    //             spline,
    //             arc_distance_miles
    //         } = all_tracks[i];
    //         for (var j = 0; j < curve_points - 1; ++j) {
    //             /*eslint no-redeclare:0*/
    //             var i_curve = (i * curve_points + j) * 6;
    //             if (arc_distance_miles <= cur_arc_distance) {
    //                 var {x,y,z} = spline.getPoint(j / (curve_points - 1));
    //                 line_positions[i_curve + 0] = x;
    //                 line_positions[i_curve + 1] = y;
    //                 line_positions[i_curve + 2] = z;
    //
    //                 var {x,y,z} = spline.getPoint((j + 1) / (curve_points - 1));
    //                 line_positions[i_curve + 3] = x;
    //                 line_positions[i_curve + 4] = y;
    //                 line_positions[i_curve + 5] = z;
    //             } else {
    //                 line_positions[i_curve + 0] = 0.0;
    //                 line_positions[i_curve + 1] = 0.0;
    //                 line_positions[i_curve + 2] = 0.0;
    //                 line_positions[i_curve + 3] = 0.0;
    //                 line_positions[i_curve + 4] = 0.0;
    //                 line_positions[i_curve + 5] = 0.0;
    //             }
    //         }
    //     }
    //
    //     _.track_lines_object.geometry.attributes.position.needsUpdate = true;
    // }

    function loadFlights() {
        var uniforms = {
            color: {
                type: "c",
                value: new THREE.Color(0x00ff00)
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
        generateControlPoints(_.SCALE + 5);
        group.add(generate_track_lines());
        group.add(generate_point_cloud());
        group.name = 'flightLine2Threejs';
        _.sphereObject = group;
        _.loaded = true;
    }

    function init() {
        _.SCALE = this._.proj.scale();
        var manager = new THREE.LoadingManager();
        var loader = new THREE.TextureLoader(manager);
        this._.options.showFlightLine = true;
        _.texture = loader.load(imgUrl, function (point_texture) {
            return point_texture;
        });
    }

    function create() {
        var o = this._.options;
        if (_.texture && !_.sphereObject && !_.loaded) {
            console.log('done add:2');
            loadFlights.call(this);
        } else if (_.sphereObject) {
            _.sphereObject.visible = o.showFlightLine;
        }
        var tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    function _reload() {
        all_tracks = [];
        point_cache = [];
        console.log('done reload');
        var tj = this.threejsPlugin;
        loadFlights.call(this);
        var grp = tj.group();
        var arr = grp.children;
        var idx = arr.findIndex(function (obj) {
            return obj.name === 'flightLine2Threejs';
        });
        grp.remove(arr[idx]);
        grp.add(_.sphereObject);
        tj.renderThree();
    }

    var start = 0;
    function interval(timestamp) {
        if (timestamp - start > 30 && !this._.drag) {
            start = timestamp;
            update_point_cloud();
            this.threejsPlugin.renderThree(true);
        }
    }

    function resize() {
        var sc = _.resize(this._.proj.scale());
        var pt = _.sphereObject.children[1];
        var _pt$geometry$attribut = pt.geometry.attributes,
            size = _pt$geometry$attribut.size,
            value = _pt$geometry$attribut.value;

        console.log(size.array);
        size.array = value.array.map(function (v) {
            return _.point(v) * sc;
        });
        console.log(size.array);
        size.needsUpdate = true;
    }

    return {
        name: 'flightLine2Threejs',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onInterval: function onInterval(t) {
            interval.call(this, t);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showFlightLine;
        },
        reload: function reload() {
            _reload.call(this);
        },
        data: function data(_data, color) {
            if (_data) {
                _.data = _data;
                if (color) {
                    var d = d3.extent(_data.map(function (x) {
                        return x[4];
                    }));
                    _.color = d3.scaleLinear().domain(d).interpolate(d3.interpolateHcl).range(colorRange);
                    _.point = d3.scaleLinear().domain(d).range([50, 500]);
                    _.maxVal = d[1];
                    console.log(d);
                } else {
                    _.color = function () {
                        return 'rgb(255, 255, 255)';
                    };
                    _.point = function () {
                        return 150;
                    };
                    _.maxVal = 1;
                }
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
        }
    };
});

var debugThreejs = (function () {
    var _ = { sphereObject: null, scale: null };

    function init() {
        this._.options.showDebugSpahre = true;
    }

    function create() {
        var o = this._.options;
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            _.scale = d3.scaleLinear().domain([0, SCALE]).range([0, 1]);
            var sphere = new THREE.SphereGeometry(SCALE, 100, 100);
            var sphereMaterial = new THREE.MeshNormalMaterial({ wireframe: false });
            var sphereMesh = new THREE.Mesh(sphere, sphereMaterial);

            // For debug ...
            var dot1 = new THREE.SphereGeometry(30, 10, 10);
            var dot2 = new THREE.SphereGeometry(30, 10, 10);
            var dot3 = new THREE.SphereGeometry(30, 10, 10);
            dot1.translate(0, 0, SCALE);
            dot2.translate(SCALE, 0, 0);
            dot3.translate(0, -SCALE, 0);
            var dot1Material = new THREE.MeshBasicMaterial({ color: 'blue' });
            var dot2Material = new THREE.MeshBasicMaterial({ color: 'red' });
            var dot3Material = new THREE.MeshBasicMaterial({ color: 'green' });
            var dot1Mesh = new THREE.Mesh(dot1, dot1Material);
            var dot2Mesh = new THREE.Mesh(dot2, dot2Material);
            var dot3Mesh = new THREE.Mesh(dot3, dot3Material);

            _.sphereObject = new THREE.Object3D();
            _.sphereObject.add(sphereMesh, dot1Mesh, dot2Mesh, dot3Mesh);
        }
        _.sphereObject.visible = o.showDebugSpahre;
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'debugThreejs',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showDebugSpahre;
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
var oceanThreejs = (function (color) {
    /*eslint no-console: 0 */
    var _ = { sphereObject: null };
    if (color) {
        _.material = new THREE.MeshBasicMaterial({
            transparent: true,
            color: color //'#555',
        });
    } else {
        _.material = new THREE.MeshNormalMaterial({
            transparent: false,
            wireframe: false,
            opacity: 0.8
        });
    }

    function init() {
        var o = this._.options;
        o.showOcean = true;
        o.transparentOcean = false;
    }

    function create() {
        var o = this._.options;
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            _.sphereObject = new THREE.Mesh(geometry, _.material);
        }
        _.material.transparent = o.transparent || o.transparentOcean;
        _.sphereObject.visible = o.showOcean;
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'oceanThreejs',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showOcean;
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

var imageThreejs = (function () {
    var imgUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world.png';

    /*eslint no-console: 0 */
    var _ = { sphereObject: null };

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var _this = this;
            var SCALE = this._.proj.scale();
            var loader = new THREE.TextureLoader();
            loader.load(imgUrl, function (map) {
                var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
                var material = new THREE.MeshBasicMaterial({ map: map });
                _.sphereObject = new THREE.Mesh(geometry, material);
                _.sphereObject.visible = _this._.options.showImage;
                tj.addGroup(_.sphereObject);
                tj.rotate();
            });
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    function refresh() {
        if (_.sphereObject) {
            _.sphereObject.visible = this._.options.showImage;
        }
    }

    return {
        name: 'imageThreejs',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showImage = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

var worldThreejs = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world.png';

    /*eslint no-console: 0 */
    var _ = { sphereObject: null };

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var mesh = topojson.mesh(_.world, _.world.objects.countries);
            var material = new THREE.MeshBasicMaterial({
                // side: THREE.DoubleSide,
                color: 0x707070 //0xefedea,
                // overdraw: 0.25,
            });
            // material
            // var material = new THREE.MeshPhongMaterial( {
            //     color: 0xff0000,
            //     shading: THREE.FlatShading,
            //     polygonOffset: true,
            //     polygonOffsetFactor: 1, // positive value pushes polygon further away
            //     polygonOffsetUnits: 1
            // });
            _.sphereObject = tj.wireframe(mesh, material);
            _.sphereObject.visible = this._.options.showLand;
        }
        // if (this.world3d) {
        //     const s = _.sphereObject.scale;
        //     s.x = 1.03;
        //     s.y = 1.03;
        //     s.z = 1.03;
        // }
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
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showLand;
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
        }
    };
});

var globeThreejs = (function () {
    var imgUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world.jpg';
    var elvUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '../d/elevation.jpg';
    var wtrUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '../d/water.png';

    /*eslint no-console: 0 */
    var _ = { sphereObject: null };
    var manager = new THREE.LoadingManager();
    var loader = new THREE.TextureLoader(manager);

    function init() {
        this._.options.showGlobe = true;
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var earth_img = loader.load(imgUrl, function (image) {
                return image;
            });
            var elevt_img = loader.load(elvUrl, function (image) {
                return image;
            });
            var water_img = loader.load(wtrUrl, function (image) {
                return image;
            });
            var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            var material = new THREE.MeshPhongMaterial({
                map: earth_img,
                bumpMap: elevt_img,
                bumpScale: 0.01,
                specularMap: water_img,
                specular: new THREE.Color('grey')
            });
            _.sphereObject = new THREE.Mesh(geometry, material);
            _.sphereObject.visible = this._.options.showGlobe;

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

    function refresh() {
        if (_.sphereObject) {
            _.sphereObject.visible = this._.options.showGlobe;
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
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    };
});

var sphereThreejs = (function () {
    var imgUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world.png';

    /*eslint no-console: 0 */
    var _ = { sphereObject: null };
    var manager = new THREE.LoadingManager();
    var loader = new THREE.TextureLoader(manager);
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
            var _this = this;
            var SCALE = this._.proj.scale();
            var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            var uniforms1 = THREE.UniformsUtils.clone(Shaders.earth.uniforms);
            var uniforms2 = THREE.UniformsUtils.clone(Shaders.atmosphere.uniforms);
            uniforms1['texture'].value = loader.load(imgUrl, function (image) {
                return image;
            });

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
            _.sphereObject.visible = _this._.options.showSphere;
            tj.addGroup(_.sphereObject);
            tj.rotate();
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    function refresh() {
        if (_.sphereObject) {
            _.sphereObject.visible = this._.options.showSphere;
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
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
        imgSrc: function imgSrc(umgUrl) {
            var material = _.me.sphere().children[0].material;

            material.uniforms.texture.value = loader.load(umgUrl, function (image) {
                return image;
            });
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
var world3d = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world_geometry.json';
    var landUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '../d/gold.jpg';
    var rtt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1.57;

    /*eslint no-console: 0 */
    var _ = { sphereObject: new THREE.Object3D() };

    function loadCountry() {
        var data = _.world;
        for (var name in data) {
            var geometry = new Map3DGeometry(data[name], 0.9);
            _.sphereObject.add(data[name].mesh = new THREE.Mesh(geometry, _.material));
        }
        _.loaded = true;
    }

    function init() {
        this._.options.showWorld = true;
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(205, 205, 205);
        makeEnvMapMaterial(landUrl, function (material) {
            _.material = material;
            if (_.world && !_.loaded) {
                loadCountry();
            }
        });
    }

    function create() {
        if (_.material && !_.loaded) {
            loadCountry();
        }
        _.sphereObject.visible = this._.options.showWorld;
        var tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    var vertexShader = '\n    varying vec2 vN;\n    void main() {\n        vec4 p = vec4( position, 1. );\n        vec3 e = normalize( vec3( modelViewMatrix * p ) );\n        vec3 n = normalize( normalMatrix * normal );\n        vec3 r = reflect( e, n );\n        float m = 2. * length( vec3( r.xy, r.z + 1. ) );\n        vN = r.xy / m + .5;\n        gl_Position = projectionMatrix * modelViewMatrix * p;\n    }\n    ';
    var fragmentShader = '\n    uniform sampler2D tMatCap;\n    varying vec2 vN;\n    void main() {\n        vec3 base = texture2D( tMatCap, vN ).rgb;\n        gl_FragColor = vec4( base, 1. );\n    }\n    ';
    function makeEnvMapMaterial(imgUrl, cb) {
        var loader = new THREE.TextureLoader();
        loader.load(imgUrl, function (value) {
            var type = 't';
            var uniforms = { tMatCap: { type: type, value: value } };
            var material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                shading: THREE.SmoothShading
            });
            cb.call(this, material);
        });
    }

    function refresh() {
        if (_.sphereObject) {
            _.sphereObject.visible = this._.options.showWorld;
        }
    }

    return {
        name: 'world3d',
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
        onRefresh: function onRefresh() {
            refresh.call(this);
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
        }
    };
});

// view-source:http://callumprentice.github.io/apps/extruded_earth/index.html
var world3d2 = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/countries.geo.json';
    var landUrl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '../d/gold.jpg';
    var inner = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.9;
    var outer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var rtt = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    /*eslint no-console: 0 */
    var _ = { sphereObject: new THREE.Object3D(), group: {} };

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
        return new THREE.Mesh(geometry, _.material);
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
        _g.add(add_country(shape_points));
    }

    function loadCountry() {
        _.world.features.forEach(function (country) {
            var coordinates = country.geometry.coordinates;

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

    function init() {
        var r = this._.proj.scale();
        this._.options.showWorld = true;
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(r, r, r);
        makeEnvMapMaterial(landUrl, function (material) {
            _.material = material;
            if (_.world && !_.loaded) {
                loadCountry();
            }
        });
    }

    function create() {
        if (_.material && !_.loaded) {
            loadCountry();
        }
        _.sphereObject.visible = this._.options.showWorld;
        var tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    var vertexShader = '\n    varying vec2 vN;\n    void main() {\n        vec4 p = vec4( position, 1. );\n        vec3 e = normalize( vec3( modelViewMatrix * p ) );\n        vec3 n = normalize( normalMatrix * normal );\n        vec3 r = reflect( e, n );\n        float m = 2. * length( vec3( r.xy, r.z + 1. ) );\n        vN = r.xy / m + .5;\n        gl_Position = projectionMatrix * modelViewMatrix * p;\n    }\n    ';
    var fragmentShader = '\n    uniform sampler2D tMatCap;\n    varying vec2 vN;\n    void main() {\n        vec3 base = texture2D( tMatCap, vN ).rgb;\n        gl_FragColor = vec4( base, 1. );\n    }\n    ';
    function makeEnvMapMaterial(imgUrl, cb) {
        var loader = new THREE.TextureLoader();
        loader.load(imgUrl, function (value) {
            var type = 't';
            var uniforms = { tMatCap: { type: type, value: value } };
            var material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                shading: THREE.SmoothShading
            });
            cb.call(this, material);
        });
    }

    function refresh() {
        if (_.sphereObject) {
            _.sphereObject.visible = this._.options.showWorld;
        }
    }

    return {
        name: 'world3d2',
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
        onRefresh: function onRefresh() {
            refresh.call(this);
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

    _.checker = [':Shadow:showDropShadow', ':Ocean:showOcean', ':Graticule:showGraticule', ':Land:showLand', ':Country:showCountries', ':Lakes:showLakes', ':Transparent:transparent',
    // ':TGraticule:transparentGraticule',
    // ':TLand:transparentLand',
    ':Canvas:showCanvas', ':Spin:spin'].map(function (d) {
        return d.split(':');
    });

    function addPlugins() {
        var _this2 = this;

        var r = this.register;
        var p = earthjs.plugins;
        r(p.mousePlugin());
        r(p.configPlugin());
        r(p.autorotatePlugin());
        r(p.dropShadowSvg());
        r(p.oceanSvg());
        r(p.canvasPlugin());
        r(p.graticuleCanvas());
        r(p.worldCanvas(worldUrl));
        this._.options.oceanColor = 2;
        this._.options.transparent = true;
        this.canvasPlugin.selectAll('.ej-canvas');
        this.graticuleCanvas.drawTo([1]);
        this.worldCanvas.drawTo([0]);

        _.options = this.configPlugin.set();
        _.buttonClick = function (str) {
            var arr = str.split(':'),
                key = arr[2],
                resultx = {},
                options = _this2.configPlugin.set();
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
            _this2.configPlugin.set(resultx);
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
                    // nodes[i].style.top = (_.pan * i)+'px';
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
            window.nodes = nodes;
            rangeInput(opt2, 'clr', 0, 5, 1, _this._.options.oceanColor, function () {
                _this._.options.oceanColor = +this.value;
                _this.oceanSvg.recreate();
            });
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
            _.options = this.configPlugin.set();
            enableController.call(this);
        }
    };
});

var selectCountryMix = (function () {
    var worldUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '../d/world-110m.json';

    /*eslint no-console: 0 */
    var _ = {};

    function init() {
        var g = this.register(earthjs.plugins.mousePlugin()).register(earthjs.plugins.hoverCanvas()).register(earthjs.plugins.clickCanvas()).register(earthjs.plugins.centerCanvas()).register(earthjs.plugins.canvasPlugin()).register(earthjs.plugins.dropShadowSvg()).register(earthjs.plugins.countryCanvas()).register(earthjs.plugins.autorotatePlugin()).register(earthjs.plugins.worldCanvas(worldUrl));
        g.canvasPlugin.selectAll('.ej-canvas');
        g._.options.showSelectedCountry = true;
        g._.options.showBorder = true;
        g.worldCanvas.ready = function (err, json) {
            g.countryCanvas.data(json);
            g.worldCanvas.data(json);
            g.hoverCanvas.data(json);
            g.clickCanvas.data(json);
        };
        g.centerCanvas.focused(function (event, country) {
            g.autorotatePlugin.stop();
            g.worldCanvas.style({});
            if (event.metaKey) {
                var arr = g.worldCanvas.selectedCountries().concat(country);
                g.worldCanvas.selectedCountries(arr);
            } else {
                g.worldCanvas.selectedCountries([country]);
            }
            console.log(country);
        });
        g.clickCanvas.onCountry({
            autorotate: function autorotate(event, country) {
                if (!country) {
                    g.worldCanvas.style({});
                    g.autorotatePlugin.start();
                    g.worldCanvas.selectedCountries([]);
                }
            }
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
            g.worldCanvas.style({ selected: 'rgba(255, 235, 0, 0.4)' });
            g.worldCanvas.selectedCountries(reg);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        }
    };
});

earthjs$2.plugins = {
    baseCsv: baseCsv,
    worldJson: worldJson,
    choroplethCsv: choroplethCsv,
    countryNamesCsv: countryNamesCsv,

    colorScale: colorScale,

    hoverCanvas: hoverCanvas,
    clickCanvas: clickCanvas,
    mousePlugin: mousePlugin,
    configPlugin: configPlugin,
    canvasPlugin: canvasPlugin,
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
    textureThreejs: textureThreejs,
    graticuleThreejs: graticuleThreejs,
    flightLineThreejs: flightLineThreejs,
    flightLine2Threejs: flightLine2Threejs,
    debugThreejs: debugThreejs,
    oceanThreejs: oceanThreejs,
    imageThreejs: imageThreejs,
    worldThreejs: worldThreejs,
    globeThreejs: globeThreejs,
    sphereThreejs: sphereThreejs,
    world3d: world3d,
    world3d2: world3d2,

    commonPlugins: commonPlugins,
    selectCountryMix: selectCountryMix
};

return earthjs$2;

}());
//# sourceMappingURL=earthjs.js.map
