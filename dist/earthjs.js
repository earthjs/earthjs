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
var earthjs$1 = function earthjs() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    /*eslint no-console: 0 */
    clearInterval(earthjs.ticker);
    options = Object.assign({
        selectAll: '#earth-js',
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
    window.__ = _;
    var drag = false;
    var svg = d3.selectAll(options.selectAll);
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
        register: function register(obj) {
            var ar = {};
            globe[obj.name] = ar;
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
                obj.onInit.call(globe);
            }
            qEvent(obj, 'onCreate');
            qEvent(obj, 'onResize');
            qEvent(obj, 'onRefresh');
            qEvent(obj, 'onInterval');
            if (obj.urls && obj.onReady) {
                _.promeses.push({
                    name: obj.name,
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
        intervalTicker = intervalTicker || 50;
        ticker = setInterval(function () {
            // 33% less CPU compare with d3.timer
            interval.call(globe);
            earths.forEach(function (p) {
                p._.interval.call(p);
            });
        }, intervalTicker);
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

    __.interval = function () {
        _.onIntervalVals.forEach(function (fn) {
            fn.call(globe);
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
        return d3.geoOrthographic().rotate(__.options.rotate).scale(__.options.width / 3.5).translate(__.center).precision(0.1).clipAngle(90);
    };

    __.proj = __.orthoGraphic();
    __.path = d3.geoPath().projection(__.proj);
    return globe;
    //----------------------------------------
    function qEvent(obj, qname) {
        if (obj[qname]) {
            _[qname][obj.name] = obj[qname];
            _[qname + 'Keys'] = Object.keys(_[qname]);
            _[qname + 'Vals'] = _[qname + 'Keys'].map(function (k) {
                return _[qname][k];
            });
        }
    }
};

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

var autorotatePlugin = (function () {
    var degPerSec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

    /*eslint no-console: 0 */
    var _ = {
        lastTick: new Date(),
        degree: degPerSec / 1000,
        sync: []
    };

    function interval() {
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

    function rotate(delta) {
        var r = this._.proj.rotate();
        r[0] += _.degree * delta;
        this._.rotate(r);
    }

    return {
        name: 'autorotatePlugin',
        onInit: function onInit() {
            this._.options.spin = true;
        },
        onInterval: function onInterval() {
            interval.call(this);
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

// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
var mousePlugin = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { zoomScale: [0, 1000] },
        zoomScale = _ref.zoomScale,
        iDrag = _ref.iDrag;

    /*eslint no-console: 0 */
    var _ = { svg: null, q: null, sync: [], mouse: null, wait: null,
        onDrag: {},
        onDragVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: []
    };
    if (zoomScale === undefined) {
        zoomScale = [0, 1000];
    }

    function onclick() {
        _.onClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
        console.log('onClick');
    }

    function ondblclick() {
        _.onDblClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
        console.log('onDblClick');
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

        _.svg.call(d3.zoom().on('zoom', zoom).scaleExtent([0.1, 5]).translateExtent([[0, 0], wh]));

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
            var mouse = d3.mouse(this);
            v0 = versor.cartesian(__.proj.invert(mouse));
            r0 = __.proj.rotate();
            q0 = versor(r0);
            __.drag = null;
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
            !iDrag && drag(__);
            // _.t1+=1; // twice call compare to onInterval
        }

        function dragsended() {
            if (__.drag === null) {
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
            } else if (__.drag) {
                r(__);
                __.rotate(_.r);
                _.onDragVals.forEach(function (v) {
                    v.call(_._this, _.mouse);
                });
                _.sync.forEach(function (g) {
                    return rotate.call(g, _.r);
                });
            }
            __.drag = false;
            __.refresh();
            // console.log('ttl:',_.t1,_.t2);
        }
    }

    return {
        name: 'mousePlugin',
        onInit: function onInit() {
            _.oMouse = [];
            var __ = this._;
            _.svg = __.svg;
            init.call(this);
        },
        onInterval: function onInterval() {
            var __ = this._;
            if (__.drag && iDrag) {
                if (_.oMouse[0] !== _.mouse[0] && _.oMouse[1] !== _.mouse[1]) {
                    _.oMouse = _.mouse;
                    drag(__);
                    // _.t2+=1;
                }
            } else if (_.wait === false) {
                _.wait = null;
                onclick();
            }
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

var zoomPlugin = (function () {
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
        onInit: function onInit() {
            init.call(this);
        }
    };
});

// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
// http://bl.ocks.org/kenpenn/16a9c611417ffbfc6129
var threejsPlugin = (function () {
    var threejs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'three-js';

    /*eslint no-console: 0 */
    /*eslint no-debugger: 0 */
    var _ = { renderer: null, scene: null, camera: null, radius: null };
    _.scale = d3.scaleLinear().domain([0, 200]).range([0, 1]);

    // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
    // Axes have been rotated so Three's "y" axis is parallel to the North Pole
    function _vertex(point) {
        var lambda = point[0] * Math.PI / 180,
            phi = point[1] * Math.PI / 180,
            cosPhi = Math.cos(phi);
        return new THREE.Vector3(_.radius * cosPhi * Math.cos(lambda), _.radius * Math.sin(phi), -_.radius * cosPhi * Math.sin(lambda));
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
        var _$options = __.options,
            width = _$options.width,
            height = _$options.height;

        var container = document.getElementById(threejs);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10000);
        _.scene = new THREE.Scene();
        _.group = new THREE.Group();
        _.camera.position.z = 1010; // (higher than RADIUS + size of the bubble)
        _.radius = __.proj.scale();
        _.scene.add(_.group);
        this._.camera = _.camera;

        _.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: container });
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        this.renderThree = renderThree;
        window.grp = _.group;
    }

    function _scale(obj) {
        if (!obj) {
            obj = _.group;
        }
        var sc = _.scale(this._.proj.scale());
        obj.scale.x = sc;
        obj.scale.y = sc;
        obj.scale.z = sc;
        renderThree.call(this);
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
        renderThree.call(this);
    }

    function renderThree() {
        setTimeout(function () {
            _.renderer.render(_.scene, _.camera);
        }, 1);
    }

    return {
        name: 'threejsPlugin',
        onInit: function onInit() {
            init.call(this);
        },
        onCreate: function onCreate() {
            _.group.children = [];
        },
        onRefresh: function onRefresh() {
            _rotate.call(this);
        },
        onResize: function onResize() {
            _scale.call(this);
        },
        addScene: function addScene(obj) {
            _.scene.add(obj);
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
        onInit: function onInit() {
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
            // this.canvasPlugin.render(function(context, path) {
            //     fn.call(this, context, path);
            // }, _.drawTo, _.options);
            // __.proj.clipAngle(90);
            var __ = this._;
            var w = __.center[0];
            var r = __.proj.rotate();
            this.canvasPlugin.render(function (context, path) {
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

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var hoverCanvas = (function () {
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
        this._.options.showSelectedCountry = false;
        if (this.worldCanvas) {
            var world = this.worldCanvas.data();
            if (world) {
                _.world = world;
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        var __ = this._;
        var mouseMoveHandler = function mouseMoveHandler() {
            var _this = this;

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
                    _.dot = v.call(_this, _.mouse, pos);
                });
            }
            if (__.options.showLand && _.countries && !_.dot) {
                if (!__.drag) {
                    _.country = findCountry(pos);
                }
                _.onCountryVals.forEach(function (v) {
                    v.call(_this, _.mouse, _.country);
                });
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
        onInit: function onInit() {
            init.call(this);
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
        var mouseClickHandler = function mouseClickHandler(event, mouse) {
            var _this = this;

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
                    _.dot = v.call(_this, _.mouse, pos);
                });
            }
            if (__.options.showLand && !_.dot) {
                if (!__.drag) {
                    _.country = findCountry(pos);
                }
                _.onCountryVals.forEach(function (v) {
                    v.call(_this, _.mouse, _.country);
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
        onInit: function onInit() {
            init.call(this);
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
        var mouseDblClickHandler = function mouseDblClickHandler(event, mouse) {
            var _this = this;

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
                    _.dot = v.call(_this, _.mouse, pos);
                });
            }
            if (__.options.showLand && !_.dot) {
                if (!__.drag) {
                    _.country = findCountry(pos);
                }
                _.onCountryVals.forEach(function (v) {
                    v.call(_this, _.mouse, _.country);
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
        onInit: function onInit() {
            initmouseClickHandler.call(this);
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

// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
var canvasThreejs = (function (worldUrl) {
    /*eslint no-console: 0 */
    /*eslint no-debugger: 0 */
    var _ = {
        sphereObject: null,
        onDraw: {},
        onDrawVals: []
    };
    var canvas = d3.select("body").append("canvas").style("display", "none").attr("width", "1024px").attr("height", "512px");
    var context = canvas.node().getContext("2d");
    var texture = new THREE.Texture(canvas.node());
    var geometry = new THREE.SphereGeometry(200, 30, 30);
    var material = new THREE.MeshBasicMaterial({ transparent: true });
    var projection = d3.geoEquirectangular().precision(0.5).translate([512, 256]).scale(163);
    var path = d3.geoPath().projection(projection).context(context);
    material.map = texture;

    function init() {
        this._.options.showTjCanvas = true;
    }

    function create() {
        var _this = this;

        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            _.sphereObject = new THREE.Mesh(geometry, material);
        }
        context.clearRect(0, 0, 1024, 512);
        context.fillStyle = "#aaa";
        context.beginPath();
        path(_.countries);
        context.fill();

        _.onDrawVals.forEach(function (v) {
            v.call(_this, context, path);
        });
        texture.needsUpdate = true;
        _.sphereObject.visible = this._.options.showTjCanvas;
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'canvasThreejs',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            this.canvasThreejs.data(data);
        },
        onInit: function onInit() {
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showTjCanvas;
        },
        onDraw: function onDraw(obj) {
            Object.assign(_.onDraw, obj);
            _.onDrawVals = Object.keys(_.onDraw).map(function (k) {
                return _.onDraw[k];
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

// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
var oceanThreejs = (function () {
    /*eslint no-console: 0 */
    var _ = { sphereObject: null };

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var geometry = new THREE.SphereGeometry(200, 30, 30);
            var material = new THREE.MeshNormalMaterial({
                transparent: true,
                wireframe: false,
                opacity: 0.8
            });
            // var material = new THREE.MeshPhongMaterial( {
            //     shading: THREE.SmoothShading, //FlatShading,
            //     transparent: true,
            //     wireframe: false,
            //     color: 0x3794cf, //0xff0000,
            //     shininess: 40,
            //     opacity: 0.8,
            //     // polygonOffset: true,
            //     // polygonOffsetFactor: 1, // positive value pushes polygon further away
            //     // polygonOffsetUnits: 1
            // });

            _.sphereObject = new THREE.Mesh(geometry, material);
            _.sphereObject.visible = this._.options.showOcean;
        }
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'oceanThreejs',
        onInit: function onInit() {
            this._.options.showOcean = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showOcean;
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
        onInit: function onInit() {
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
        onInit: function onInit() {
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

// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
var textureThreejs = (function () {
    /*eslint no-console: 0 */
    var _ = {};
    var geometry = new THREE.SphereGeometry(200, 30, 30);
    var material = new THREE.MeshBasicMaterial();
    var datumGraticule = d3.geoGraticule()();

    function init() {
        this._.options.showDrawing = true;
        //http://bl.ocks.org/MAKIO135/eab7b74e85ed2be48eeb
        var __ = this._;
        var width = __.options.width;
        var height = __.options.height;
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

        // var geometry = new THREE.BoxGeometry( 200, 200, 200 );
        // _.context.clearRect(0, 0, width, height);

        // _.context.font = '20pt Arial';
        // _.context.fillStyle = 'red';
        // _.context.fillRect(0, 0, _.canvas.width, _.canvas.height);
        // _.context.fillStyle = 'white';
        // _.context.fillRect(10, 10, _.canvas.width - 20, _.canvas.height - 20);
        // _.context.fillStyle = 'black';
        // _.context.textAlign = "center";
        // _.context.textBaseline = "middle";
        // _.context.fillText(new Date().getTime(), _.canvas.width / 2, _.canvas.height / 2);
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
            // const material = new THREE.LineBasicMaterial({color: 0xaaaaaa});
            // _.sphereObject = tj.wireframe(_.graticule10, material); //0x800000
            // _.sphereObject.visible = this._.options.showDrawing;
        }
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'textureThreejs',
        onInit: function onInit() {
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
        onInit: function onInit() {
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
        tj.rotate();
    }

    return {
        name: 'graticuleThreejs',
        onInit: function onInit() {
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showGraticule;
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
        onInit: function onInit() {
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
        onInit: function onInit() {
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
        onInit: function onInit() {
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
                if (_this.dotTooltipSvg.onShow) {
                    d = _this.dotTooltipSvg.onShow.call(this, d, dotTooltip);
                }
                _this.dotTooltipSvg.show(d.properties).style('display', 'block').style('opacity', 1);
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
        onInit: function onInit() {
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

    function detect(mouse, pos) {
        var dot = null;
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
            var hoverHandler = function hoverHandler(mouse, pos) {
                var dot = detect(mouse, pos);
                _.onHoverVals.forEach(function (v) {
                    v.call(_this, mouse, dot);
                });
                return dot;
            };
            this.hoverCanvas.onCircle({
                dotsCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            var clickHandler = function clickHandler(mouse, pos) {
                var dot = detect(mouse, pos);
                _.onClickVals.forEach(function (v) {
                    v.call(_this, mouse, dot);
                });
                return dot;
            };
            this.clickCanvas.onCircle({
                dotsCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            var dblClickHandler = function dblClickHandler(mouse, pos) {
                var dot = detect(mouse, pos);
                _.onDblClickVals.forEach(function (v) {
                    v.call(_this, mouse, dot);
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
        onInit: function onInit() {
            initCircleHandler.call(this);
        },
        onCreate: function onCreate() {
            if (this.dotsCanvas && !_.dots) {
                this.dotSelectCanvas.dots(this.dotsCanvas.dots());
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

var dotTooltipCanvas = (function () {
    /*eslint no-console: 0 */
    var dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    function init() {
        var _this = this;

        var hoverHandler = function hoverHandler(mouse, d) {
            if (d) {
                if (_this.dotTooltipCanvas.onShow) {
                    d = _this.dotTooltipCanvas.onShow.call(_this, d, dotTooltip);
                }
                _this.dotTooltipCanvas.show(d.properties).style('display', 'block').style('opacity', 1).style('left', mouse[0] + 7 + 'px').style('top', mouse[1] - 15 + 'px');
            } else {
                dotTooltip.style('opacity', 0).style('display', 'none');
            }
        };
        this.dotSelectCanvas.onHover({
            dotTooltipCanvas: hoverHandler
        });
    }

    return {
        name: 'dotTooltipCanvas',
        onInit: function onInit() {
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
            var hoverHandler = function hoverHandler(mouse, country) {
                _.onHoverVals.forEach(function (v) {
                    v.call(_this, mouse, country);
                });
                return country;
            };
            this.hoverCanvas.onCountry({
                countrySelectCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            var clickHandler = function clickHandler(mouse, country) {
                _.onClickVals.forEach(function (v) {
                    v.call(_this, mouse, country);
                });
                return country;
            };
            this.clickCanvas.onCountry({
                countrySelectCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            var dblClickHandler = function dblClickHandler(mouse, country) {
                _.onDblClickVals.forEach(function (v) {
                    v.call(_this, mouse, country);
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
        onInit: function onInit() {
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

    function init() {
        var _this = this;

        var toolTipsHandler = function toolTipsHandler(mouse, d) {
            // fn with  current context
            if (!_this._.drag && d && _this._.options.showCountryTooltip) {
                var country = countryName(d);
                if (country && !(_this.barTooltipSvg && _this.barTooltipSvg.visible())) {
                    refresh(mouse).style('display', 'block').style('opacity', 1).text(country.name);
                } else {
                    hideTooltip();
                }
            } else {
                hideTooltip();
            }
        };
        this.hoverCanvas.onCountry({
            countryTooltipCanvas: toolTipsHandler
        });
        if (this.mousePlugin) {
            this.mousePlugin.onDrag({
                countryTooltipCanvas: toolTipsHandler
            });
        }
        this._.options.showCountryTooltip = true;
    }

    function refresh(mouse) {
        return countryTooltip.style('left', mouse[0] + 7 + 'px').style('top', mouse[1] - 15 + 'px');
    }

    function hideTooltip() {
        countryTooltip.style('opacity', 0).style('display', 'none');
    }

    return {
        name: 'countryTooltipCanvas',
        urls: countryNameUrl && [countryNameUrl],
        onReady: function onReady(err, countryNames) {
            _.countryNames = countryNames;
        },
        onInit: function onInit() {
            init.call(this);
        },
        onRefresh: function onRefresh() {
            if (this._.drag) {
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
        onInit: function onInit() {
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
                if (_this.barTooltipSvg.onShow) {
                    d = _this.barTooltipSvg.onShow.call(this, d, barTooltip);
                }
                _this.barTooltipSvg.show(d).style('display', 'block').style('opacity', 1);
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
        onInit: function onInit() {
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
        onInit: function onInit() {
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
    var _ = { world: null, style: {}, drawTo: null, options: {}, landColor: 0 };

    function create() {
        var __ = this._;
        if (_.world && __.options.showLand) {
            if (__.options.transparent || __.options.transparentLand) {
                this.canvasPlugin.flipRender(function (context, path) {
                    context.beginPath();
                    path(_.land);
                    context.fillStyle = _.style.backLand || 'rgba(119,119,119,0.2)';
                    context.fill();
                }, _.drawTo, _.options);
            }
            __.options.showCountries ? canvasAddCountries.call(this) : canvasAddWorld.call(this);
            if (!__.drag) {
                __.options.showLakes && canvasAddLakes.call(this);
                if (this.hoverCanvas && __.options.showSelectedCountry) {
                    this.canvasPlugin.render(function (context, path) {
                        context.beginPath();
                        path(this.hoverCanvas.data().country);
                        context.fillStyle = 'rgba(117, 0, 0, 0.4)';
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
        this.canvasPlugin.render(function (context, path) {
            var c = _.landColor;
            context.beginPath();
            path(_.countries);
            context.fillStyle = _.style.land || (typeof c === 'number' ? color[c] : c);
            context.fill();
            context.lineWidth = 0.1;
            context.strokeStyle = _.style.countries || 'rgb(239, 237, 234)';
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
            this.worldCanvas.data(data);
            Object.defineProperty(this._.options, 'landColor', {
                get: function get() {
                    return _.landColor;
                },
                set: function set(x) {
                    _.landColor = x;
                }
            });
        },
        onInit: function onInit() {
            var options = this._.options;
            options.showLand = true;
            options.showLakes = true;
            options.showCountries = true;
            options.transparentLand = false;
            options.landColor = 0;
        },
        onCreate: function onCreate() {
            var _this = this;

            create.call(this);
            if (this.hoverCanvas) {
                var worldCanvas = function worldCanvas() {
                    if (!_this._.options.spin) {
                        _this._.refresh();
                    }
                };
                this.hoverCanvas.onCountry({ worldCanvas: worldCanvas });
            }
        },
        onRefresh: function onRefresh() {
            create.call(this);
        },
        countries: function countries() {
            return _.countries.features;
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.land = topojson.feature(_data, _data.objects.land);
                _.lakes = topojson.feature(_data, _data.objects.ne_110m_lakes);
                _.countries = topojson.feature(_data, _data.objects.countries);
            } else {
                return _.world;
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

var worldSvg = (function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = { svg: null, q: null, world: null };
    var $ = {};

    function create() {
        var __ = this._;
        _.svg.selectAll('.landbg,.land,.lakes,.countries').remove();
        if (__.options.showLand) {
            if (_.world) {
                if (__.options.transparent || __.options.transparentLand) {
                    _.svgAddWorldBg.call(this);
                }
                if (!__.drag && __.options.showCountries) {
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
        if (_.world && __.options.showLand) {
            if (__.options.transparent || __.options.transparentLand) {
                __.proj.clipAngle(180);
                $.worldBg.attr('d', __.path);
                __.proj.clipAngle(90);
            }
            if (__.options.showCountries) {
                $.countries.attr('d', __.path);
            } else {
                $.world.attr('d', __.path);
            }
            if (__.options.showLakes) {
                $.lakes.attr('d', __.path);
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
            this.worldSvg.data(data);
        },
        onInit: function onInit() {
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
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        countries: function countries() {
            return _.countries.features;
        },
        data: function data(_data) {
            if (_data) {
                _.world = _data;
                _.land = topojson.feature(_data, _data.objects.land);
                _.lakes = topojson.feature(_data, _data.objects.ne_110m_lakes);
                _.countries = topojson.feature(_data, _data.objects.countries);
            } else {
                return _.world;
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
                color: 0x707070 });
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
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'worldThreejs',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            this.worldThreejs.data(data);
        },
        onInit: function onInit() {
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
            var loader = new THREE.TextureLoader();
            loader.load(imgUrl, function (map) {
                var geometry = new THREE.SphereGeometry(200, 30, 30);
                var material = new THREE.MeshBasicMaterial({ map: map });
                _.sphereObject = new THREE.Mesh(geometry, material);
                _.sphereObject.visible = _this._.options.showImage;
                tj.addGroup(_.sphereObject);
                tj.rotate();
            });
        } else {
            tj.addGroup(_.sphereObject);
            tj.rotate();
        }
    }

    return {
        name: 'imageThreejs',
        onInit: function onInit() {
            this._.options.showImage = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showImage;
        }
    };
});

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
var centerCanvas = (function () {
    /*eslint no-console: 0 */
    var _ = { focused: null };

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
        if (this.clickCanvas) {
            this.clickCanvas.onCountry({
                centerCanvas: function centerCanvas(mouse, country) {
                    if (country) {
                        transition.call(_this, d3.geoCentroid(country));
                        if (typeof _.focused === 'function') {
                            _.focused.call(_this);
                        }
                    }
                }
            });
        }
    }

    return {
        name: 'centerCanvas',
        onInit: function onInit() {
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
        onInit: function onInit() {
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

var flattenPlugin = (function () {
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
        name: 'flattenPlugin',
        onInit: function onInit() {
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
            this.barSvg.data(bars);
        },
        onInit: function onInit() {
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
            this.dotsSvg.data(dots);
        },
        onInit: function onInit() {
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
            this.pinCanvas.data(json);
        },
        onInit: function onInit() {
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
            this.dotsCanvas.data(json);
        },
        onInit: function onInit() {
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
        tj.rotate();
    }

    function create1() {
        var _this = this;
        _.dots = new THREE.Group();
        _.dataDots.features.forEach(function (d) {
            var dot = createDot.call(_this, d);
            dot && _.dots.add(dot);
        });
    }

    // function create2() {
    // }

    return {
        name: 'dotsThreejs',
        urls: urlJson && [urlJson],
        onReady: function onReady(err, data) {
            this.dotsThreejs.data(data);
        },
        onInit: function onInit() {
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
        var __ = this._;
        __.options.showDots = true;
        this.canvasThreejs.onDraw({
            dotsCThreejs: function dotsCThreejs(context, path) {
                if (__.options.showDots) {
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
            this.dotsCThreejs.data(dots);
        },
        onInit: function onInit() {
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

var pingsCanvas = (function () {
    var _ = { dataPings: null, pings: [] };

    function interval() {
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

    return {
        name: 'pingsCanvas',
        onInit: function onInit() {
            this._.options.showPings = true;
        },
        onInterval: function onInterval() {
            interval.call(this);
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
        onInit: function onInit() {
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

var debugThreejs = (function () {
    var _ = { sphereObject: null, scale: null };
    _.scale = d3.scaleLinear().domain([0, 200]).range([0, 1]);

    function init() {
        this._.options.showDebugSpahre = true;
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

            refresh.call(this);
            this.threejsPlugin.addScene(_.sphereObject);
        }
    }

    function resize() {
        var sc = _.scale(this._.proj.scale());
        var se = _.sphereObject;
        se.scale.x = sc;
        se.scale.y = sc;
        se.scale.z = sc;
    }

    function refresh() {
        var rt = this._.proj.rotate();
        rt[0] -= 90;
        var q1 = this._.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        _.sphereObject.setRotationFromQuaternion(q2);
    }

    return {
        name: 'debugThreejs',
        onInit: function onInit() {
            init.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onRefresh: function onRefresh() {
            if (_.sphereObject) {
                refresh.call(this);
            }
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
        onInit: function onInit() {
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

earthjs$1.plugins = {
    configPlugin: configPlugin,
    autorotatePlugin: autorotatePlugin,
    mousePlugin: mousePlugin,
    zoomPlugin: zoomPlugin,
    threejsPlugin: threejsPlugin,
    canvasPlugin: canvasPlugin,
    hoverCanvas: hoverCanvas,
    clickCanvas: clickCanvas,
    dblClickCanvas: dblClickCanvas,
    canvasThreejs: canvasThreejs,
    oceanThreejs: oceanThreejs,
    oceanSvg: oceanSvg,
    sphereSvg: sphereSvg,
    textureThreejs: textureThreejs,
    graticuleCanvas: graticuleCanvas,
    graticuleThreejs: graticuleThreejs,
    graticuleSvg: graticuleSvg,
    dropShadowSvg: dropShadowSvg,
    fauxGlobeSvg: fauxGlobeSvg,
    dotTooltipSvg: dotTooltipSvg,
    dotSelectCanvas: dotSelectCanvas,
    dotTooltipCanvas: dotTooltipCanvas,
    countrySelectCanvas: countrySelectCanvas,
    countryTooltipCanvas: countryTooltipCanvas,
    countryTooltipSvg: countryTooltipSvg,
    barTooltipSvg: barTooltipSvg,
    placesSvg: placesSvg,
    worldCanvas: worldCanvas,
    worldSvg: worldSvg,
    worldThreejs: worldThreejs,
    imageThreejs: imageThreejs,
    centerCanvas: centerCanvas,
    centerSvg: centerSvg,
    flattenPlugin: flattenPlugin,
    barSvg: barSvg,
    dotsSvg: dotsSvg,
    pinCanvas: pinCanvas,
    dotsCanvas: dotsCanvas,
    dotsThreejs: dotsThreejs,
    dotsCThreejs: dotsCThreejs,
    pingsCanvas: pingsCanvas,
    pingsSvg: pingsSvg,
    debugThreejs: debugThreejs,
    commonPlugins: commonPlugins
};

return earthjs$1;

}());
//# sourceMappingURL=earthjs.js.map
