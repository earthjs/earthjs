var earthjs = (function () {
'use strict';

// Version 0.0.0. Copyright 2017 Mike Bostock.
var versorFn = function () {
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
};

var versor = versorFn();
var earthjs$1 = function earthjs() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    /*eslint no-console: 0 */
    clearInterval(earthjs.ticker);
    options = Object.assign({
        select: '#earth',
        rotate: 130
    }, options);
    var _ = {
        onResize: {},
        onResizeKeys: [],

        onRefresh: {},
        onRefreshKeys: [],

        onInterval: {},
        onIntervalKeys: [],

        renderOrder: ['renderThree', 'svgAddDropShadow', 'svgAddCanvas', 'canvasAddGraticule', 'canvasAddWorldOrCountries', 'canvasAddDots', 'svgAddOcean', 'svgAddGlobeShading', 'svgAddGraticule', 'svgAddWorldOrCountries', 'svgAddGlobeHilight', 'svgAddPlaces', 'svgAddPings', 'svgAddDots', 'svgAddBar'],
        ready: null,
        loadingData: null,
        promeses: []
    };
    var drag = false;
    var svg = d3.selectAll(options.select);
    var width = svg.attr('width'),
        height = svg.attr('height');
    var ltScale = d3.scaleLinear().domain([0, width]).range([-180, 180]);
    if (!width || !height) {
        width = options.width || 700;
        height = options.height || 500;
        svg.attr("width", width).attr("height", height);
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
            options: options,
            ltScale: ltScale
        },
        $: {},
        ready: function ready(fn) {
            if (fn) {
                if (_.promeses.length > 0) {
                    _.loadingData = true;
                    var q = d3.queue();
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
        register: function register(obj) {
            var ar = {};
            globe[obj.name] = ar;
            Object.keys(obj).forEach(function (fn) {
                if (['urls', 'onReady', 'onInit', 'onResize', 'onRefresh', 'onInterval'].indexOf(fn) === -1) {
                    if (typeof obj[fn] === 'function') {
                        ar[fn] = function () {
                            return obj[fn].apply(globe, arguments);
                        };
                    }
                }
            });
            if (obj.onInit) {
                obj.onInit.call(globe);
            }
            qEvent(obj, 'onResize');
            qEvent(obj, 'onRefresh');
            qEvent(obj, 'onInterval');
            if (obj.urls && obj.onReady) {
                _.promeses.push({
                    urls: obj.urls,
                    onReady: obj.onReady
                });
            }
            return globe;
        }
    };

    //----------------------------------------
    var earths = [];
    var ticker = null;
    var __ = globe._;

    globe.svgDraw = function (twinEarth) {
        var $ = globe.$;
        earths = twinEarth || [];
        _.renderOrder.forEach(function (renderer) {
            $[renderer] && $[renderer].call(globe);
        });
        earths.forEach(function (p) {
            p.svgDraw(null);
        });
        if (ticker === null && earths !== []) {
            __.ticker();
        }
        return globe;
    };

    __.defs = __.svg.append("defs");
    __.ticker = function (interval) {
        var ex = __.intervalRun;
        interval = interval || 50;
        ticker = setInterval(function () {
            ex.call(globe);
            earths.forEach(function (p) {
                p._.intervalRun.call(p);
            });
        }, interval);
        earthjs.ticker = ticker;
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

    __.intervalRun = function () {
        _.onIntervalKeys.forEach(function (fn) {
            _.onInterval[fn].call(globe);
        });
        return globe;
    };

    __.refresh = function (filter) {
        var keys = filter ? _.onRefreshKeys.filter(function (d) {
            return filter.test(d);
        }) : _.onRefreshKeys;
        keys.forEach(function (fn) {
            _.onRefresh[fn].call(globe);
        });
        return globe;
    };

    __.resize = function () {
        _.onResizeKeys.forEach(function (fn) {
            _.onResize[fn].call(globe);
        });
        return globe;
    };

    __.orthoGraphic = function () {
        return d3.geoOrthographic().rotate([__.options.rotate, 0]).scale(__.options.width / 3.5).translate(__.center).precision(0.1).clipAngle(90);
    };

    __.addRenderer = function (name) {
        if (_.renderOrder.indexOf(name) < 0) {
            _.renderOrder.push(name);
        }
    };

    __.proj = __.orthoGraphic();
    __.path = d3.geoPath().projection(__.proj);
    return globe;
    //----------------------------------------
    function qEvent(obj, qname) {
        if (obj[qname]) {
            _[qname][obj.name] = obj[qname];
            _[qname + 'Keys'] = Object.keys(_[qname]);
        }
    }
};

// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
var versorDragPlugin = function () {
    /*eslint no-console: 0 */
    var _ = { svg: null, q: null, sync: [] };

    function dragSetup() {
        var __ = this._;
        var versor = __.versor;
        _.svg.call(d3.drag().on('start', dragstarted).on('end', dragsended).on('drag', dragged));

        var v0 = void 0,
            // Mouse position in Cartesian coordinates at start of drag gesture.
        r0 = void 0,
            // Projection rotation as Euler angles at start.
        q0 = void 0; // Projection rotation as versor at start.

        function rotate(r) {
            var d = r[0] - r0[0];
            r[0] = d + this._.proj.rotate()[0];
            if (r[0] >= 180) r[0] -= 360;
            this._.rotate(r);
        }

        function dragstarted() {
            v0 = versor.cartesian(__.proj.invert(d3.mouse(this)));
            r0 = __.proj.rotate();
            q0 = versor(r0);
            __.drag = null;
            __.refresh();
        }

        function dragged() {
            var v1 = versor.cartesian(__.proj.rotate(r0).invert(d3.mouse(this))),
                q1 = versor.multiply(q0, versor.delta(v0, v1)),
                r1 = versor.rotation(q1);
            __.rotate(r1);
            __.drag = true;
        }

        function dragsended() {
            var r = __.proj.rotate();
            _.sync.forEach(function (g) {
                rotate.call(g, r);
            });
            __.drag = false;
            __.refresh();
        }
    }

    return {
        name: 'versorDragPlugin',
        onInit: function onInit() {
            _.svg = this._.svg;
            dragSetup.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
                dragSetup.call(this);
            }
            return _.svg;
        },
        sync: function sync(arr) {
            _.sync = arr;
        }
    };
};

var wheelZoomPlugin = function () {
    /*eslint no-console: 0 */
    return {
        name: 'wheelZoomPlugin',
        onInit: function onInit() {
            var __ = this._;
            __.svg.on('wheel', function () {
                var y = d3.event.deltaY + __.proj.scale();
                y = y < 20 ? 20 : y > 999 ? 1000 : y;
                __.scale(y);
            });
        }
    };
};

// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
var threejsPlugin = function () {
    var _ = { renderer: null, scene: null, camera: null, scale: null };

    function renderThree() {
        setTimeout(function () {
            _.renderer.render(_.scene, _.camera);
        }, 1);
    }

    return {
        name: 'threejsPlugin',
        onInit: function onInit() {
            var width = this._.options.width,
                height = this._.options.height;
            _.scene = new THREE.Scene();
            _.yAxis = new THREE.Vector3(0, 1, 0);
            _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10000);
            _.camera.position.z = 500; // (higher than RADIUS + size of the bubble)
            this._.camera = _.camera;

            // Create renderer object.
            _.renderer = new THREE.WebGLRenderer({ antialias: true });
            _.renderer.domElement.id = 'three-js';
            _.renderer.setClearColor('white', 1);
            _.renderer.setSize(width, height);
            document.body.appendChild(_.renderer.domElement);

            this.renderThree = renderThree; // renderer
        },
        onRefresh: function onRefresh() {
            renderThree.call(this);
        },
        addObject: function addObject(obj) {
            _.scene.add(obj);
        }
    };
};

// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
var canvasPlugin = (function () {
    /*eslint no-console: 0 */
    var _ = { canvas: null, path: null, q: null };

    function svgAddCanvas() {
        if (this._.options.showCanvas) {
            if (!_.canvas) {
                var fObject = this._.svg.append("g").attr("class", "canvas").append("foreignObject").attr("x", 0).attr("y", 0).attr("width", this._.options.width).attr("height", this._.options.height);
                var fBody = fObject.append("xhtml:body").style("margin", "0px").style("padding", "0px").style("background-color", "none").style("width", this._.options.width + "px").style("height", this._.options.height + "px");
                _.canvas = fBody.append("canvas");
            }
            _.canvas.attr("x", 0).attr("y", 0).attr("width", this._.options.width).attr("height", this._.options.height);
            return _.canvas;
        }
    }

    return {
        name: 'canvasPlugin',
        onInit: function onInit() {
            this._.options.showCanvas = true;
            this.$.svgAddCanvas = svgAddCanvas;
            _.path = d3.geoPath().projection(this._.proj);
        },
        onRefresh: function onRefresh() {
            var width = this._.options.width,
                height = this._.options.height;
            _.canvas.each(function () {
                this.getContext("2d").clearRect(0, 0, width, height);
            });
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

            if (this._.options.showCanvas) {
                var rChange = false;
                var proj = this._.proj;
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
                        var context = this.getContext("2d");
                        fn.call(_this, context, _.path.context(context));
                    }
                });
                if (rChange) {
                    rChange = false;
                    proj.rotate(r);
                }
            }
        }
    };
});

var oceanPlugin = function () {
    var _ = { svg: null, q: null, scale: 0 };

    function svgAddOcean() {
        _.svg.selectAll('#ocean,.ocean').remove();
        if (this._.options.showOcean) {
            var ocean_fill = this._.defs.append("radialGradient").attr("id", "ocean").attr("cx", "75%").attr("cy", "25%");
            ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#ddf");
            ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "#9ab");
            this._.ocean = _.svg.append("g").attr("class", "ocean").append("circle").attr("cx", this._.center[0]).attr("cy", this._.center[1]).attr("class", "noclicks");
            resize.call(this);
            return this._.ocean;
        }
    }

    function resize() {
        if (this._.ocean && this._.options.showOcean) {
            this._.ocean.attr("r", this._.proj.scale() + _.scale);
        }
    }

    return {
        name: 'oceanPlugin',
        onInit: function onInit() {
            this.$.svgAddOcean = svgAddOcean;
            this._.options.showOcean = true;
            _.svg = this._.svg;
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
        }
    };
};

var configPlugin = function () {
    return {
        name: 'configPlugin',
        set: function set(newOpt) {
            if (newOpt) {
                Object.assign(this._.options, newOpt);
                if (newOpt.spin !== undefined) {
                    var rotate = this.autorotatePlugin;
                    newOpt.spin ? rotate.start() : rotate.stop();
                }
                this.svgDraw();
            }
            return Object.assign({}, this._.options);
        }
    };
};

var graticuleCanvas = function () {
    var datumGraticule = d3.geoGraticule()();
    var _ = { style: {}, drawTo: null };

    function canvasAddGraticule() {
        if (this._.options.showGraticule) {
            this.canvasPlugin.render(function (context, path) {
                context.beginPath();
                path(datumGraticule);
                context.lineWidth = 0.3;
                context.strokeStyle = _.style.line || 'rgba(119,119,119,0.4)';
                context.stroke();
            }, _.drawTo);
        }
    }

    return {
        name: 'graticuleCanvas',
        onInit: function onInit() {
            this.$.canvasAddGraticule = canvasAddGraticule;
            this._.options.showGraticule = true;
        },
        onRefresh: function onRefresh() {
            canvasAddGraticule.call(this);
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        }
    };
};

var graticulePlugin = function () {
    var datumGraticule = d3.geoGraticule();
    var _ = { svg: null, q: null };

    function svgAddGraticule() {
        _.svg.selectAll('.graticule').remove();
        if (this._.options.showGraticule) {
            this._.graticule = _.svg.append("g").attr("class", "graticule").append("path").datum(datumGraticule).attr("class", "noclicks");
            refresh.call(this);
            return this._.graticule;
        }
    }

    function refresh() {
        if (this._.graticule && this._.options.showGraticule) {
            this._.graticule.attr("d", this._.path);
        }
    }

    return {
        name: 'graticulePlugin',
        onInit: function onInit() {
            this.$.svgAddGraticule = svgAddGraticule;
            this._.options.showGraticule = true;
            _.svg = this._.svg;
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
        }
    };
};

// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
var fauxGlobePlugin = function () {
    /*eslint no-console: 0 */
    var _ = { svg: null, q: null };

    function svgAddDropShadow() {
        var __ = this._;
        _.svg.selectAll('#drop_shadow,.drop_shadow').remove();
        if (__.options.showGlobeShadow) {
            var drop_shadow = __.defs.append("radialGradient").attr("id", "drop_shadow").attr("cx", "50%").attr("cy", "50%");
            drop_shadow.append("stop").attr("offset", "20%").attr("stop-color", "#000").attr("stop-opacity", ".5");
            drop_shadow.append("stop").attr("offset", "100%").attr("stop-color", "#000").attr("stop-opacity", "0");
            __.dropShadow = _.svg.append("g").attr("class", "drop_shadow").append("ellipse").attr("cx", __.center[0]).attr("cy", __.options.height - 50).attr("rx", __.proj.scale() * 0.90).attr("ry", __.proj.scale() * 0.25).attr("class", "noclicks").style("fill", "url(#drop_shadow)");
            __.dropShadow;
        }
    }

    function svgAddGlobeShading() {
        var __ = this._;
        _.svg.selectAll('#shading,.shading').remove();
        if (__.options.showGlobeShading) {
            var globe_shading = __.defs.append("radialGradient").attr("id", "shading").attr("cx", "50%").attr("cy", "40%");
            globe_shading.append("stop").attr("offset", "50%").attr("stop-color", "#9ab").attr("stop-opacity", "0");
            globe_shading.append("stop").attr("offset", "100%").attr("stop-color", "#3e6184").attr("stop-opacity", "0.3");
            __.globeShading = _.svg.append("g").attr("class", "shading").append("circle").attr("cx", __.center[0]).attr("cy", __.center[1]).attr("r", __.proj.scale()).attr("class", "noclicks").style("fill", "url(#shading)");
            return __.globeShading;
        }
    }

    function svgAddGlobeHilight() {
        var __ = this._;
        _.svg.selectAll('#hilight,.hilight').remove();
        if (__.options.showGlobeHilight) {
            var globe_highlight = __.defs.append("radialGradient").attr("id", "hilight").attr("cx", "75%").attr("cy", "25%");
            globe_highlight.append("stop").attr("offset", "5%").attr("stop-color", "#ffd").attr("stop-opacity", "0.6");
            globe_highlight.append("stop").attr("offset", "100%").attr("stop-color", "#ba9").attr("stop-opacity", "0.2");
            __.globeHilight = _.svg.append("g").attr("class", "hilight").append("circle").attr("cx", __.center[0]).attr("cy", __.center[1]).attr("r", __.proj.scale()).attr("class", "noclicks").style("fill", "url(#hilight)");
            return __.globeHilight;
        }
    }

    return {
        name: 'fauxGlobePlugin',
        onInit: function onInit() {
            var options = this._.options;

            options.showGlobeShadow = true;
            options.showGlobeShading = true;
            options.showGlobeHilight = true;
            this.$.svgAddDropShadow = svgAddDropShadow;
            this.$.svgAddGlobeHilight = svgAddGlobeHilight;
            this.$.svgAddGlobeShading = svgAddGlobeShading;
            _.svg = this._.svg;
        },
        onResize: function onResize() {
            var __ = this._;
            var options = __.options;

            var scale = __.proj.scale();
            if (__.globeShading && options.showGlobeShading) {
                __.globeShading.attr("r", scale);
            }
            if (__.globeHilight && options.showGlobeHilight) {
                __.globeHilight.attr("r", scale);
            }
            if (__.dropShadow && options.showGlobeShadow) {
                __.dropShadow.attr("cy", scale + 250).attr("rx", scale * 0.90).attr("ry", scale * 0.25);
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        }
    };
};

var autorotatePlugin = (function (degPerSec) {
    /*eslint no-console: 0 */
    var _ = {
        lastTick: new Date(),
        degree: degPerSec,
        sync: []
    };

    function rotate(delta) {
        var r = this._.proj.rotate();
        r[0] += _.degree * delta / 1000;
        this._.rotate(r);
    }

    return {
        name: 'autorotatePlugin',
        onInit: function onInit() {
            this._.options.spin = true;
        },
        onInterval: function onInterval() {
            var now = new Date();
            if (!this._.options.spin || this._.drag) {
                _.lastTick = now;
            } else {
                var delta = now - _.lastTick;
                rotate.call(this, delta);
                _.sync.forEach(function (g) {
                    return rotate.call(g, delta);
                });
                _.lastTick = now;
            }
        },
        speed: function speed(degPerSec) {
            _.degree = degPerSec;
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

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var countryTooltipPlugin = function () {
    var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

    return {
        name: 'countryTooltipPlugin',
        onInit: function onInit() {
            var _this = this;
            var originalsvgAddCountries = this.$.svgAddCountries;
            this.$.svgAddCountries = function () {
                return originalsvgAddCountries.call(this).on("mouseover", function (d) {
                    var country = _this.worldPlugin.countryName.call(_this, d);
                    countryTooltip.text(country.name).style("left", d3.event.pageX + 7 + "px").style("top", d3.event.pageY - 15 + "px").style("display", "block").style("opacity", 1);
                }).on("mouseout", function () {
                    countryTooltip.style("opacity", 0).style("display", "none");
                }).on("mousemove", function () {
                    countryTooltip.style("left", d3.event.pageX + 7 + "px").style("top", d3.event.pageY - 15 + "px");
                });
            };
        }
    };
};

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var barTooltipPlugin = function () {
    var barTooltip = d3.select("body").append("div").attr("class", "barTooltip");

    return {
        name: 'barTooltipPlugin',
        onInit: function onInit() {
            var _this = this;
            var originalsvgAddBar = this.$.svgAddBar;
            this.$.svgAddBar = function () {
                return originalsvgAddBar.call(this).on("mouseover", function () {
                    var i = +this.dataset.index;
                    var d = _this.barPlugin.data().features[i];
                    if (_this.barTooltipPlugin.onShow) {
                        d = _this.barTooltipPlugin.onShow.call(this, d, i, barTooltip);
                    }
                    _this.barTooltipPlugin.show(d).style("left", d3.event.pageX + 7 + "px").style("top", d3.event.pageY - 15 + "px").style("display", "block").style("opacity", 1);
                }).on("mouseout", function () {
                    barTooltip.style("opacity", 0).style("display", "none");
                }).on("mousemove", function () {
                    barTooltip.style("left", d3.event.pageX + 7 + "px").style("top", d3.event.pageY - 15 + "px");
                });
            };
        },
        show: function show(d) {
            var props = d.properties;
            var title = Object.keys(props).map(function (k) {
                return k + ': ' + props[k];
            }).join("<br/>");
            return barTooltip.html(title);
        }
    };
};

var placesPlugin = function (urlPlaces) {
    var _ = { svg: null, q: null, places: null };

    function svgAddPlaces() {
        _.svg.selectAll('.points,.labels').remove();
        if (_.places) {
            if (this._.options.showPlaces) {
                svgAddPlacePoints.call(this);
                svgAddPlaceLabels.call(this);
                refresh.call(this);
            }
        }
    }

    function refresh() {
        if (this._.placePoints) {
            this._.placePoints.attr("d", this._.path);
            position_labels.call(this);
        }
    }

    function svgAddPlacePoints() {
        this._.placePoints = _.svg.append("g").attr("class", "points").selectAll("path").data(_.places.features).enter().append("path").attr("class", "point");
        return this._.placePoints;
    }

    function svgAddPlaceLabels() {
        this._.placeLabels = _.svg.append("g").attr("class", "labels").selectAll("text").data(_.places.features).enter().append("text").attr("class", "label").text(function (d) {
            return d.properties.name;
        });
        return this._.placeLabels;
    }

    function position_labels() {
        var _this = this;
        var centerPos = this._.proj.invert(this._.center);

        this._.placeLabels.attr("text-anchor", function (d) {
            var x = _this._.proj(d.geometry.coordinates)[0];
            return x < _this._.center[0] - 20 ? "end" : x < _this._.center[0] + 20 ? "middle" : "start";
        }).attr("transform", function (d) {
            var loc = _this._.proj(d.geometry.coordinates),
                x = loc[0],
                y = loc[1];
            var offset = x < _this._.center[0] ? -5 : 5;
            return "translate(" + (x + offset) + "," + (y - 2) + ")";
        }).style("display", function (d) {
            return d3.geoDistance(d.geometry.coordinates, centerPos) > 1.57 ? 'none' : 'inline';
        });
    }

    return {
        name: 'placesPlugin',
        urls: urlPlaces && [urlPlaces],
        onReady: function onReady(err, places) {
            _.places = places;
        },
        onInit: function onInit() {
            this.$.svgAddPlaces = svgAddPlaces;
            this._.options.showPlaces = true;
            _.svg = this._.svg;
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
        data: function data(p) {
            if (p) {
                var data = p.placesPlugin.data();
                _.places = data.places;
            } else {
                return { places: _.places };
            }
        }
    };
};

// John J Czaplewski’s Block http://bl.ocks.org/jczaplew/6798471
var worldCanvas = (function (urlWorld, urlCountryNames) {
    /*eslint no-debugger: 0 */
    /*eslint no-console: 0 */
    var _ = { world: null, countryNames: null, style: {}, drawTo: null, options: {} };

    function canvasAddWorldOrCountries() {
        if (_.world && this._.options.showLand) {
            canvasAddWorld.call(this);
            if (!this._.drag) {
                if (this._.options.showCountries) {
                    canvasAddCountries.call(this);
                }
                if (this._.options.showLakes) {
                    canvasAddLakes.call(this);
                }
            }
        }
    }

    function canvasAddWorld() {
        this.canvasPlugin.render(function (context, path) {
            context.beginPath();
            path(_.land);
            context.fillStyle = _.style.land || 'rgba(117, 87, 57, 0.4)';
            context.fill();
        }, _.drawTo, _.options);
    }

    function canvasAddCountries() {
        this.canvasPlugin.render(function (context, path) {
            context.beginPath();
            path(_.countries);
            context.lineWidth = 0.5;
            context.strokeStyle = _.style.countries || 'rgba(80, 64, 39, 0.6)';
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

    var urls = null;
    if (urlWorld) {
        urls = [urlWorld];
        if (urlCountryNames) {
            urls.push(urlCountryNames);
        }
    }

    return {
        name: 'worldCanvas',
        urls: urls,
        onReady: function onReady(err, world, countryNames) {
            this.worldCanvas.data({ world: world, countryNames: countryNames });
        },
        onInit: function onInit() {
            this._.options.showLand = true;
            this._.options.showLakes = true;
            this._.options.showCountries = true;
            this.$.canvasAddWorldOrCountries = canvasAddWorldOrCountries;
        },
        onRefresh: function onRefresh() {
            canvasAddWorldOrCountries.call(this);
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data.world;
                _.countryNames = _data.countryNames;
                _.land = topojson.feature(_.world, _.world.objects.land);
                _.lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);
                _.countries = topojson.feature(_.world, _.world.objects.countries);
            }
            return {
                world: _.world,
                countryNames: _.countryNames
            };
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        options: function options(_options) {
            _.options = _options;
        }
    };
});

var worldPlugin = function (urlWorld, urlCountryNames) {
    var _ = { svg: null, q: null, world: null, countryNames: null };
    var countryClick = function countryClick() {
        // console.log(d);
    };

    function svgAddWorldOrCountries() {
        _.svg.selectAll('.land,.lakes,.countries').remove();
        if (this._.options.showLand) {
            if (_.world) {
                if (this._.options.showCountries) {
                    this.$.svgAddCountries.call(this);
                } else {
                    this.$.svgAddWorld.call(this);
                }
                if (this._.options.showLakes) {
                    this.$.svgAddLakes.call(this);
                }
            }
            refresh.call(this);
        }
    }

    function refresh() {
        if (_.world && this._.options.showLand) {
            if (this._.options.showCountries) {
                this._.countries.attr("d", this._.path);
            } else {
                this._.world.attr("d", this._.path);
            }
            if (this._.options.showLakes) {
                this._.lakes.attr("d", this._.path);
            }
        }
    }

    function svgAddWorld() {
        this._.world = _.svg.append("g").attr("class", "land").append("path").datum(_.land);
        return this._.world;
    }

    function svgAddCountries() {
        this._.countries = _.svg.append("g").attr("class", "countries").selectAll("path").data(_.countries.features).enter().append("path").on('click', countryClick).attr("id", function (d) {
            return 'x' + d.id;
        });
        return this._.countries;
    }

    function svgAddLakes() {
        this._.lakes = _.svg.append("g").attr("class", "lakes").append("path").datum(_.lakes);
        return this._.lakes;
    }

    var urls = null;
    if (urlWorld) {
        urls = [urlWorld];
        if (urlCountryNames) {
            urls.push(urlCountryNames);
        }
    }
    return {
        name: 'worldPlugin',
        urls: urls,
        onReady: function onReady(err, world, countryNames) {
            this.worldPlugin.data({ world: world, countryNames: countryNames });
        },
        onInit: function onInit() {
            this._.options.showLand = true;
            this._.options.showLakes = true;
            this._.options.showCountries = true;
            this.$.svgAddWorldOrCountries = svgAddWorldOrCountries;
            this.$.svgAddCountries = svgAddCountries;
            this.$.svgAddLakes = svgAddLakes;
            this.$.svgAddWorld = svgAddWorld;
            _.svg = this._.svg;
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        countries: function countries() {
            return _.countries.features;
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data.world;
                _.countryNames = _data.countryNames;
                _.land = topojson.feature(_.world, _.world.objects.land);
                _.lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);
                _.countries = topojson.feature(_.world, _.world.objects.countries);
            }
            return {
                world: _.world,
                countryNames: _.countryNames
            };
        },
        countryName: function countryName(d) {
            var cname = '';
            if (_.countryNames) {
                cname = _.countryNames.find(function (x) {
                    return x.id == d.id;
                });
            }
            return cname;
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        }
    };
};

var worldThreejs = function () {
    var _ = { sphereObject: null };

    function addWorld() {
        if (!_.sphereObject) {
            var _this = this;
            var group = new THREE.Group();
            var loader = new THREE.TextureLoader();
            loader.load("./d/world.jpg", function (texture) {
                var geometry = new THREE.SphereGeometry(200, 20, 20);
                var material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
                _.sphereObject = new THREE.Mesh(geometry, material);
                group.add(_.sphereObject);
                rotate.call(_this);
            });
            _this.threejsPlugin.addObject(group);
        }
    }

    function rotate() {
        var rt = this._.proj.rotate();
        rt[0] -= 90;
        var q1 = this._.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        _.sphereObject.setRotationFromQuaternion(q2);
    }

    return {
        name: 'worldThreejs',
        onInit: function onInit() {
            addWorld.call(this);
        },
        onRefresh: function onRefresh() {
            if (_.sphereObject) {
                rotate.call(this);
            }
        }
    };
};

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var centerPlugin = (function () {
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
        var _this2 = this;

        d3.transition().duration(2500).tween("rotate", function () {
            var r = d3.interpolate(_this2._.proj.rotate(), [-p[0], -p[1]]);
            return function (t) {
                _this2._.rotate(r(t));
            };
        });
    }

    function svgAddCountries() {
        var _this = this;
        var countries = _.svgAddCountriesOld.call(this);
        countries.on("click", function () {
            var id = this.id.replace('x', '');
            var c = _this.worldPlugin.countries();
            var focusedCountry = country(c, id);
            var p = d3.geoCentroid(focusedCountry);
            transition.call(_this, p);
            if (typeof _.focused === 'function') {
                _.focused.call(_this);
            }
        });
        return countries;
    }

    return {
        name: 'centerPlugin',
        onInit: function onInit() {
            _.svgAddCountriesOld = this.$.svgAddCountries;
            this.$.svgAddCountries = svgAddCountries;
        },
        go: function go(id) {
            var c = this.worldPlugin.countries();
            var focusedCountry = country(c, id),
                p = d3.geoCentroid(focusedCountry);
            transition.call(this, p);
        },
        focused: function focused(fn) {
            _.focused = fn;
        }
    };
});

var flattenPlugin = function () {
    /*eslint no-console: 0 */
    var _ = {};

    function animation() {
        var _this = this;
        return _this._.svg.transition().duration(10500).tween("projection", function () {
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
        return d3.transition().duration(1500).tween("rotate", function () {
            var r = d3.interpolate(__.proj.rotate(), [0, 0]);
            return function (t) {
                __.rotate(r(t));
            };
        });
    }

    return {
        name: 'flattenPlugin',
        onInit: function onInit() {
            var g1 = this._.proj;
            var g2 = d3.geoEquirectangular().scale(this._.options.width / 6.3).translate(this._.center);
            _.g1 = g1;
            _.g2 = g2;
        },
        toMap: function toMap() {
            var _this2 = this;

            defaultRotate.call(this).on('end', function () {
                var proj = interpolatedProjection(_.g1, _.g2);
                _this2._.path = d3.geoPath().projection(proj);
                animation.call(_this2);
            });
        },
        toGlobe: function toGlobe() {
            var _this3 = this;

            this._.rotate([0, 0, 0]);
            var proj = interpolatedProjection(_.g2, _.g1);
            this._.path = d3.geoPath().projection(proj);
            animation.call(this).on('end', function () {
                _this3._.path = d3.geoPath().projection(_this3._.proj);
                _this3._.refresh();
            });
        }
    };
};

var barPlugin = (function (urlBars) {
    /*eslint no-console: 0 */
    var _ = { svg: null, barProjection: null, q: null, bars: null };

    function svgAddBar() {
        var __ = this._;
        _.svg.selectAll('.bar').remove();
        if (_.bars && __.options.showBars) {
            var gBar = _.svg.append("g").attr("class", "bar");
            var mask = gBar.append("mask").attr("id", "edge");
            mask.append("rect").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%").attr("fill", "white");
            mask.append("use").attr("xlink:href", "#edgeCircle").attr("fill", "black");
            __.mask = mask;

            _.max = d3.max(_.bars.features, function (d) {
                return parseInt(d.properties.mag);
            });

            var scale = __.proj.scale();
            _.lengthScale = d3.scaleLinear().domain([0, _.max]).range([scale, scale + 50]);

            __.bar = gBar.selectAll("line").data(_.bars.features).enter().append("line").attr("stroke", "red").attr("stroke-width", "2").attr("data-index", function (d, i) {
                return i;
            });
            // render to correct position
            refresh.call(this);
            return __.bar;
        }
    }

    function refresh() {
        var __ = this._;
        if (_.bars && __.options.showBars) {
            var proj1 = __.proj;
            var scale = _.lengthScale;
            var proj2 = _.barProjection;
            var center = proj1.invert(__.center);
            __.bar.each(function (d) {
                var arr = d.geometry.coordinates;
                proj2.scale(scale(d.properties.mag));
                var distance = d3.geoDistance(arr, center);
                var d1 = proj1(arr);
                var d2 = proj2(arr);
                d3.select(this).attr('x1', d1[0]).attr('y1', d1[1]).attr('x2', d2[0]).attr('y2', d2[1]).attr('mask', distance < 1.57 ? null : 'url(#edge)');
            });
        }
    }

    function svgClipPath() {
        var __ = this._;
        __.defs.selectAll('clipPath').remove();
        __.defs.append("clipPath").append("circle").attr("id", "edgeCircle").attr("cx", __.center[0]).attr("cy", __.center[1]).attr("r", __.proj.scale());
    }

    return {
        name: 'barPlugin',
        urls: urlBars && [urlBars],
        onReady: function onReady(err, bars) {
            var _this = this;

            _.bars = bars;
            setTimeout(function () {
                return refresh.call(_this);
            }, 1);
        },
        onInit: function onInit() {
            var __ = this._;
            this.$.svgAddBar = svgAddBar;
            this.$.svgClipPath = svgClipPath;
            this._.options.showBars = true;
            _.barProjection = __.orthoGraphic();
            _.svg = __.svg;
            svgClipPath.call(this);
        },
        onResize: function onResize() {
            svgClipPath.call(this);
            svgAddBar.call(this);
        },
        onRefresh: function onRefresh() {
            _.barProjection.rotate(this._.proj.rotate());
            refresh.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        data: function data(_data) {
            if (_data) {
                _.bars = _data;
            } else {
                return _.bars;
            }
        }
    };
});

var dotsPlugin = function () {
    var _ = { dataDots: null };

    function svgAddDots() {
        if (_.dataDots && this._.options.showDots && !this._.drag) {
            this._.svg.selectAll('.dot').remove();
            if (_.dataDots && this._.options.showDots) {
                this._.dots = this._.svg.append("g").attr("class", "dot").selectAll('circle').data(_.dataDots.features).enter().append('circle').attr('r', 2).attr('stroke', '#F00').style('opacity', 0.75);
                refresh.call(this);
                return this._.dots;
            }
        }
    }

    function refresh() {
        if (this._.drag == null) {
            this._.dots.style("display", 'none');
        } else if (!this._.drag && this._.dots && this._.options.showDots) {
            var proj = this._.proj;
            var center = this._.proj.invert(this._.center);
            this._.dots.attr('cx', function (d) {
                return proj(d.geometry.coordinates)[0];
            }).attr('cy', function (d) {
                return proj(d.geometry.coordinates)[1];
            }).style("display", function (d) {
                return d3.geoDistance(d.geometry.coordinates, center) > 1.57 ? 'none' : 'inline';
            });
        }
    }

    return {
        name: 'dotsPlugin',
        onInit: function onInit() {
            this.$.svgAddDots = svgAddDots;
            this._.options.showDots = true;
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        data: function data(_data) {
            _.dataDots = _data;
        }
    };
};

var dotsCanvas = function () {
    var _ = { dataDots: null };

    function canvasAddDots() {
        if (_.dataDots && this._.options.showDots && !this._.drag) {
            var proj = this._.proj;
            var center = proj.invert(this._.center);
            this.canvasPlugin.render(function (context) {
                _.dataDots.features.forEach(function (d) {
                    if (d3.geoDistance(d.geometry.coordinates, center) <= 1.57) {
                        context.beginPath();
                        context.fillStyle = '#F00';
                        context.arc(proj(d.geometry.coordinates)[0], proj(d.geometry.coordinates)[1], 2, 0, 2 * Math.PI);
                        context.fill();
                        context.closePath();
                    }
                });
            }, _.drawTo);
        }
    }

    return {
        name: 'dotsCanvas',
        onInit: function onInit() {
            this.$.canvasAddDots = canvasAddDots;
            this._.options.showDots = true;
        },
        onRefresh: function onRefresh() {
            canvasAddDots.call(this);
        },
        data: function data(_data) {
            _.dataDots = _data;
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        }
    };
};

var pingsCanvas = function () {
    var _ = { dataPings: null, pings: [] };

    return {
        name: 'pingsCanvas',
        onInit: function onInit() {
            this._.options.showPings = true;
        },
        onInterval: function onInterval() {
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
        },
        data: function data(_data) {
            _.dataPings = _data;
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        }
    };
};

var pingsPlugin = function () {
    /*eslint no-console: 0 */
    var _ = { svg: null, dataPings: null, ping2: null };

    function svgAddPings() {
        _.svg.selectAll('.pings').remove();
        if (_.dataPings && this._.options.showPings) {
            var g = _.svg.append("g").attr("class", "pings");
            _.ping2 = g.selectAll('.ping-2').data(_.dataPings.features).enter().append('circle').attr('class', 'ping-2').attr('id', function (d, i) {
                return "ping-" + i;
            });

            this._.pings = g.selectAll('.ping-2');
            refresh.call(this);
            animate.call(this);
            return this._.pings;
        }
    }

    function animate() {
        var nodes = _.ping2.nodes().filter(function (d) {
            return d.style.display == 'inline';
        });
        if (nodes.length > 0) {
            d3.select("#" + nodes[Math.floor(Math.random() * (nodes.length - 1))].id).attr('r', 2).attr('stroke', '#F00').attr('stroke-opacity', 1).attr('stroke-width', '10px').transition().duration(1000).attr('r', 30).attr('fill', 'none').attr('stroke-width', '0.1px');
        }
    }

    function refresh() {
        if (this._.drag == null) {
            this._.pings.style("display", 'none');
        } else if (!this._.drag && this._.pings && this._.options.showPings) {
            var proj = this._.proj;
            var center = this._.proj.invert(this._.center);
            this._.pings.attr('cx', function (d) {
                return proj(d.geometry.coordinates)[0];
            }).attr('cy', function (d) {
                return proj(d.geometry.coordinates)[1];
            }).style("display", function (d) {
                return d3.geoDistance(d.geometry.coordinates, center) > 1.57 ? 'none' : 'inline';
            });
        }
    }

    return {
        name: 'pingsPlugin',
        onInit: function onInit() {
            var _this = this;

            this.$.svgAddPings = svgAddPings;
            this._.options.showPings = true;
            setInterval(function () {
                return animate.call(_this);
            }, 3000);
            _.svg = this._.svg;
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        data: function data(_data) {
            _.dataPings = _data;
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        }
    };
};

var debugThreejs = function () {
    var _ = { sphereObject: null };

    function addDebugSphere() {
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
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

            rotate.call(this);
            this.threejsPlugin.addObject(_.sphereObject);
        }
    }

    function rotate() {
        var rt = this._.proj.rotate();
        rt[0] -= 90;
        var q1 = this._.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        _.sphereObject.setRotationFromQuaternion(q2);
    }

    return {
        name: 'debugThreejs',
        onInit: function onInit() {
            this._.options.showDebugSpahre = true;
            addDebugSphere.call(this);
        },
        onRefresh: function onRefresh() {
            if (_.sphereObject) {
                rotate.call(this);
            }
        }
    };
};

var commonPlugins = (function (urlWorld) {
    var _ = { checker: [] };
    return {
        name: 'commonPlugins',
        onInit: function onInit() {
            var _this = this;

            var rg = this.register;
            var pl = earthjs.plugins;
            rg(pl.autorotatePlugin(10));
            rg(pl.versorDragPlugin());
            rg(pl.wheelZoomPlugin());
            rg(pl.configPlugin());
            rg(pl.oceanPlugin());
            rg(pl.canvasPlugin());
            rg(pl.graticuleCanvas());
            rg(pl.worldCanvas(urlWorld));

            this.canvasPlugin.selectAll('.canvas');
            this.ready(function () {
                return _this.svgDraw();
            });

            _.options = this.configPlugin.set();
            _.buttonClick = function (str) {
                var arr = str.split(':'),
                    key = arr[2],
                    resultx = {},
                    options = _.options;
                options[key] = !options[key];
                resultx[key] = options[key];
                if (key == 'hideCountries') resultx.hideLand = false;
                _this.configPlugin.set(resultx);
            };

            _.checker = ['ocean:Ocean:showOcean', 'graticule:Graticule:showGraticule', 'hideLand:Land:showLand', 'spin:Spin:spin'].map(function (d) {
                return d.split(':');
            });
            var opt = d3.select('.set-options');
            opt.selectAll('button').data(_.checker).enter().append('button').text(function (d) {
                return d[1];
            }).on('click', function (d) {
                return _.buttonClick.call(_this, d.join(':'));
            });
        },
        addChecker: function addChecker(checker) {
            var _this2 = this;

            _.checker.push(checker);
            _.options = this.configPlugin.set();

            var opt = d3.select('.set-options');
            opt.selectAll('button').data(_.checker).enter().append('button').text(function (d) {
                return d[1];
            }).on('click', function (d) {
                return _.buttonClick.call(_this2, d.join(':'));
            });
        }
    };
});

earthjs$1.plugins = {
    versorDragPlugin: versorDragPlugin,
    wheelZoomPlugin: wheelZoomPlugin,
    threejsPlugin: threejsPlugin,
    canvasPlugin: canvasPlugin,
    oceanPlugin: oceanPlugin,
    configPlugin: configPlugin,
    graticuleCanvas: graticuleCanvas,
    graticulePlugin: graticulePlugin,
    fauxGlobePlugin: fauxGlobePlugin,
    autorotatePlugin: autorotatePlugin,
    countryTooltipPlugin: countryTooltipPlugin,
    barTooltipPlugin: barTooltipPlugin,
    placesPlugin: placesPlugin,
    worldCanvas: worldCanvas,
    worldPlugin: worldPlugin,
    worldThreejs: worldThreejs,
    centerPlugin: centerPlugin,
    flattenPlugin: flattenPlugin,
    barPlugin: barPlugin,
    dotsPlugin: dotsPlugin,
    dotsCanvas: dotsCanvas,
    pingsCanvas: pingsCanvas,
    pingsPlugin: pingsPlugin,
    debugThreejs: debugThreejs,
    commonPlugins: commonPlugins
};

return earthjs$1;

}());
//# sourceMappingURL=earthjs.js.map
