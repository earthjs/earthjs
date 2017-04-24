(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.earthjs = factory());
}(this, (function () { 'use strict';

var app$1 = function (options={}) {
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
    };
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
                        };
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
    };

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
    };

    planet.svgDraw = function() {
        _.svgCreateOrder.forEach(function(svgCreateKey) {
            planet[svgCreateKey] && planet[svgCreateKey](planet, options);
        });
        if (ticker===null) {
            planet._.ticker();
        }
        return planet;
    };

    planet._.refresh = refresh;
    planet._.resize = resize;

    //----------------------------------------
    // Helper

    planet._.scale = function(y) {
        planet._.proj.scale(y);
        planet._.resize(planet, options);
        planet._.refresh(planet, options);
        return planet;
    };

    planet._.rotate = function(r) {
        planet._.proj.rotate(r);
        planet._.refresh(planet, options);
        return planet;
    };

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
};

// Version 0.0.0. Copyright 2017 Mike Bostock.
var versorFn = function() {
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
      var l = e[0] / 2 * radians, sl = sin(l), cl = cos(l), // λ / 2
          p = e[1] / 2 * radians, sp = sin(p), cp = cos(p), // φ / 2
          g = e[2] / 2 * radians, sg = sin(g), cg = cos(g); // γ / 2
      return [
        cl * cp * cg + sl * sp * sg,
        sl * cp * cg - cl * sp * sg,
        cl * sp * cg + sl * cp * sg,
        cl * cp * sg - sl * sp * cg
      ];
    }

    // Returns Cartesian coordinates [x, y, z] given spherical coordinates [λ, φ].
    versor.cartesian = function(e) {
      var l = e[0] * radians, p = e[1] * radians, cp = cos(p);
      return [cp * cos(l), cp * sin(l), sin(p)];
    };

    // Returns the Euler rotation angles [λ, φ, γ] for the given quaternion.
    versor.rotation = function(q) {
      return [
        atan2(2 * (q[0] * q[1] + q[2] * q[3]), 1 - 2 * (q[1] * q[1] + q[2] * q[2])) * degrees,
        asin(max(-1, min(1, 2 * (q[0] * q[2] - q[3] * q[1])))) * degrees,
        atan2(2 * (q[0] * q[3] + q[1] * q[2]), 1 - 2 * (q[2] * q[2] + q[3] * q[3])) * degrees
      ];
    };

    // Returns the quaternion to rotate between two cartesian points on the sphere.
    versor.delta = function(v0, v1) {
      var w = cross(v0, v1), l = sqrt(dot(w, w));
      if (!l) return [1, 0, 0, 0];
      var t = acos(max(-1, min(1, dot(v0, v1)))) / 2, s = sin(t); // t = θ / 2
      return [cos(t), w[2] / l * s, -w[1] / l * s, w[0] / l * s];
    };

    // Returns the quaternion that represents q0 * q1.
    versor.multiply = function(q0, q1) {
      return [
        q0[0] * q1[0] - q0[1] * q1[1] - q0[2] * q1[2] - q0[3] * q1[3],
        q0[0] * q1[1] + q0[1] * q1[0] + q0[2] * q1[3] - q0[3] * q1[2],
        q0[0] * q1[2] - q0[1] * q1[3] + q0[2] * q1[0] + q0[3] * q1[1],
        q0[0] * q1[3] + q0[1] * q1[2] - q0[2] * q1[1] + q0[3] * q1[0]
      ];
    };

    function cross(v0, v1) {
      return [
        v0[1] * v1[2] - v0[2] * v1[1],
        v0[2] * v1[0] - v0[0] * v1[2],
        v0[0] * v1[1] - v0[1] * v1[0]
      ];
    }

    function dot(v0, v1) {
      return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
    }

    return versor;
};

// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
//
var versor = versorFn();
var versorDragPlugin = function() {
    return {
        name: 'versorDragPlugin',
        onInit(planet) {
            planet._.svg.call(d3.drag()
                .on('start', dragstarted)
                .on('end',   dragsended)
                .on('drag',  dragged));

            var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
                r0, // Projection rotation as Euler angles at start.
                q0; // Projection rotation as versor at start.

            function dragstarted() {
                planet._.drag = true;
                v0 = versor.cartesian(planet._.proj.invert(d3.mouse(this)));
                r0 = planet._.proj.rotate();
                q0 = versor(r0);
            }

            function dragsended() {
                planet._.drag = false;
            }

            function dragged() {
                var v1 = versor.cartesian(planet._.proj.rotate(r0).invert(d3.mouse(this))),
                    q1 = versor.multiply(q0, versor.delta(v0, v1)),
                    r1 = versor.rotation(q1);
                planet._.rotate(r1);
            }
        }
    }
};

var wheelZoomPlugin = function() {
    return {
        name: 'wheelZoomPlugin',
        onInit(planet) {
            planet._.svg.on('wheel', function() {
                var y = d3.event.deltaY+ planet._.proj.scale();
                // var y = (y>=4 ? y/4 : y) + planet._.proj.scale();
                if (y>230 && y<1000) {
                    planet._.scale(y);
                }
            });
        }
    }
};

var oceanPlugin = function(initOptions={}) {
    function svgAddOcean(planet, options) {
        planet._.svg.selectAll('#ocean,.ocean').remove();
        if (!options.hideOcean) {
            var ocean_fill = planet._.defs.append("radialGradient")
                .attr("id", "ocean")
                .attr("cx", "75%")
                .attr("cy", "25%");
            ocean_fill.append("stop")
                .attr("offset", "5%")
                .attr("stop-color", "#ddf");
            ocean_fill.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#9ab");
            planet._.ocean = planet._.svg.append("circle")
                .attr("cx",options.width / 2).attr("cy", options.height / 2)
                .attr("r", planet._.proj.scale())
                .attr("class", "ocean noclicks")
                .style("fill", "url(#ocean)");
            return planet._.ocean;
        }
    }

    initOptions = Object.assign({
        hideOcean: false,
    }, initOptions);

    return {
        name: 'oceanPlugin',
        onInit(planet, options) {
            Object.assign(options, initOptions);
            planet.svgAddOcean = svgAddOcean;
        },
        onResize(planet, options) {
            if (planet._.ocean && !options.hideOcean) {
                planet._.ocean.attr("r", planet._.proj.scale());
            }
        }
    }
};

var configPlugin = function() {
    return {
        name: 'configPlugin',
        set(planet, options, newOpt) {
            if (newOpt) {
                Object.assign(options, newOpt);
                if (newOpt.stop!==undefined) {
                    var p = planet.autorotatePlugin;
                    newOpt.stop ? p.stop() : p.start();
                }
                planet._.drag = true;
                planet.svgDraw();
                planet._.drag = false;
            }
            return Object.assign({}, options);
        }
    }
};

var graticulePlugin = function(initOptions={}) {
    var datumGraticule = d3.geoGraticule();

    function svgAddGraticule(planet, options) {
        planet._.svg.selectAll('.graticule').remove();
        if (!options.hideGraticule) {
            planet._.graticule = planet._.svg.append("g").attr("class","graticule").append("path")
                .datum(datumGraticule)
                .style("fill", "none")
                .style("opacity", "0.2")
                .style("stroke", "black")
                .style("stroke-width", "0.5")
                .attr("class", "noclicks")
                .attr("d", planet._.path);
            return planet._.graticule;
        }
    }

    initOptions = Object.assign({
        hideGraticule: false,
    }, initOptions);

    return {
        name: 'graticulePlugin',
        onInit(planet, options) {
            Object.assign(options, initOptions);
            planet.svgAddGraticule = svgAddGraticule;
        },
        onRefresh(planet, options) {
            if (planet._.graticule && !options.hideGraticule) {
                planet._.graticule.attr("d", planet._.path);
            }
        },
    }
};

// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
//
var fauxGlobePlugin = function(initOptions={}) {
    function svgAddDropShadow(planet, options) {
        planet._.svg.selectAll('#drop_shadow,.drop_shadow').remove();
        if (!options.hideGlobeShadow) {
            var drop_shadow = planet._.defs.append("radialGradient")
                  .attr("id", "drop_shadow")
                  .attr("cx", "50%")
                  .attr("cy", "50%");
                drop_shadow.append("stop")
                  .attr("offset","20%").attr("stop-color", "#000")
                  .attr("stop-opacity",".5");
                drop_shadow.append("stop")
                  .attr("offset","100%").attr("stop-color", "#000")
                  .attr("stop-opacity","0");
            planet._.dropShadow = planet._.svg.append("ellipse")
                  .attr("cx", options.width/2).attr("cy", options.height-50)
                  .attr("rx", planet._.proj.scale()*0.90)
                  .attr("ry", planet._.proj.scale()*0.25)
                  .attr("class", "drop_shadow noclicks")
                  .style("fill", "url(#drop_shadow)");
            planet._.dropShadow;
        }
    }

    function svgAddGlobeShading(planet, options) {
        planet._.svg.selectAll('#globe_shading,.globe_shading').remove();
        if (!options.hideGlobeShading) {
            var globe_shading = planet._.defs.append("radialGradient")
                  .attr("id", "globe_shading")
                  .attr("cx", "50%")
                  .attr("cy", "40%");
                globe_shading.append("stop")
                  .attr("offset","50%").attr("stop-color", "#9ab")
                  .attr("stop-opacity","0");
                globe_shading.append("stop")
                  .attr("offset","100%").attr("stop-color", "#3e6184")
                  .attr("stop-opacity","0.3");
            planet._.globeShading = planet._.svg.append("circle")
                .attr("cx", options.width / 2).attr("cy", options.height / 2)
                .attr("r",  planet._.proj.scale())
                .attr("class","globe_shading noclicks")
                .style("fill", "url(#globe_shading)");
            return planet._.globeShading;
        }
    }

    function svgAddGlobeHilight(planet, options) {
        planet._.svg.selectAll('#globe_hilight,.globe_hilight').remove();
        if (!options.hideGlobeHilight) {
            var globe_highlight = planet._.defs.append("radialGradient")
                  .attr("id", "globe_hilight")
                  .attr("cx", "75%")
                  .attr("cy", "25%");
                globe_highlight.append("stop")
                  .attr("offset", "5%").attr("stop-color", "#ffd")
                  .attr("stop-opacity","0.6");
                globe_highlight.append("stop")
                  .attr("offset", "100%").attr("stop-color", "#ba9")
                  .attr("stop-opacity","0.2");
            planet._.globeHilight = planet._.svg.append("circle")
                .attr("cx", options.width / 2).attr("cy", options.height / 2)
                .attr("r",  planet._.proj.scale())
                .attr("class","globe_hilight noclicks")
                .style("fill", "url(#globe_hilight)");
            return planet._.globeHilight;
        }
    }

    initOptions = Object.assign({
        hideGlobeShadow: false,
        hideGlobeShading: false,
        hideGlobeHilight: false,
    }, initOptions);

    return {
        name: 'fauxGlobePlugin',
        onInit(planet, options) {
            Object.assign(options, initOptions);
            planet.svgAddDropShadow = svgAddDropShadow;
            planet.svgAddGlobeHilight = svgAddGlobeHilight;
            planet.svgAddGlobeShading = svgAddGlobeShading;
        },
        onResize(planet, options) {
            if (planet._.globeShading && !options.hideGlobeShading) {
                planet._.globeShading.attr("r", planet._.proj.scale());
            }
            if (planet._.globeHilight && !options.hideGlobeHilight) {
                planet._.globeHilight.attr("r", planet._.proj.scale());
            }
        }
    }
};

var autorotatePlugin = function(degPerSec) {
    var _ = {
        stop: false,
        lastTick: null,
        degree: degPerSec
    };

    return {
        name: 'autorotatePlugin',
        onInit(planet, options) {},
        onInterval(planet, options) {
            var now = new Date();
            if (planet._.drag || _.stop || !_.lastTick) {
                _.lastTick = now;
            } else {
                var delta = now - _.lastTick;
                var rotation = planet._.proj.rotate();
                rotation[0] += _.degree * delta / 1000;
                if (rotation[0] >= 180)
                    rotation[0] -= 360;
                planet._.proj.rotate(rotation);
                planet._.refresh(planet, options);
                _.lastTick = now;
            }
        },
        speed(planet, options, degPerSec) {
            _.degree = degPerSec;
        },
        start(planet, options) {
            _.stop = false;
        },
        stop(planet, options) {
            _.stop = true;
        }
    };
};

var placesPlugin = function(jsonUrl='./d/places.json') {
    var _ = {places: null};

    function svgAddPlaces(planet, options) {
        planet._.svg.selectAll('.points,.labels').remove();
        if (_.places) {
            if (options.places && !options.hidePlaces) {
                svgAddPlacePoints(planet, options);
                svgAddPlaceLabels(planet, options);
                position_labels(planet, options);
            }
        }
    }

    function svgAddPlacePoints(planet) {
        planet._.placePoints = planet._.svg.append("g").attr("class","points").selectAll("path")
            .data(_.places.features).enter().append("path")
            .attr("class", "point")
            .attr("d", planet._.path);
        return planet._.placePoints;
    }

    function svgAddPlaceLabels(planet) {
        planet._.placeLabels = planet._.svg.append("g").attr("class","labels").selectAll("text")
            .data(_.places.features).enter().append("text")
            .attr("class", "label")
            .text(function(d) { return d.properties.name });
        return planet._.placeLabels;
    }

    function position_labels(planet, options) {
        var centerPos = planet._.proj.invert([options.width / 2, options.height/2]);

        planet._.placeLabels
            .attr("text-anchor",function(d) {
                var x = planet._.proj(d.geometry.coordinates)[0];
                return x < options.width/2-20 ? "end" :
                       x < options.width/2+20 ? "middle" :
                       "start"
            })
            .attr("transform", function(d) {
                var loc = planet._.proj(d.geometry.coordinates),
                    x = loc[0],
                    y = loc[1];
                var offset = x < options.width/2 ? -5 : 5;
                return "translate(" + (x+offset) + "," + (y-2) + ")"
            })
            .style("display", function(d) {
                return d3.geoDistance(d.geometry.coordinates, centerPos) > 1.57 ? 'none' : 'inline';
            });
    }

    return {
        name: 'placesPlugin',
        data: [jsonUrl],
        ready(planet, options, err, places) {
            _.places = places;
            planet.svgDraw();
        },
        onInit(planet, options) {
            options.places = true;
            options.hidePlaces = false;
            planet.svgAddPlaces = svgAddPlaces;
        },
        onRefresh(planet, options) {
            if (planet._.placePoints && options.places) {
                planet._.placePoints.attr("d", planet._.path);
                position_labels(planet, options);
            }
        }
    };
};

var worldPlugin = function(jsonWorld='./d/world-110m.json', tsvCountryNames) {
    var _ = {world: null, countryNames: null};
    var countryClick = function() {
        // console.log(d);
    };

    function svgAddWorldOrCountries(planet, options) {
        planet._.svg.selectAll('.land,.lakes,.countries').remove();
        if (!options.hideLand) {
            if (_.world) {
                if (!options.hideCountries) {
                    planet.svgAddCountries(planet, options);
                } else {
                    planet.svgAddWorld(planet, options);
                }
                planet.svgAddLakes(planet, options);
            }
        }
    }

    function svgAddCountries(planet) {
        planet._.countries = planet._.svg.append("g").attr("class","countries").selectAll("path")
        .data(topojson.feature(_.world, _.world.objects.countries).features)
        .enter().append("path").attr("id",function(d) {return 'x'+d.id})
        .on('click', countryClick)
        .attr("d", planet._.path);
        return planet._.countries;
    }

    function svgAddWorld(planet) {
        planet._.world = planet._.svg.append("g").attr("class","land").append("path")
        .datum(topojson.feature(_.world, _.world.objects.land))
        .attr("d", planet._.path);
        return planet._.world;
    }

    function svgAddLakes(planet) {
        planet._.lakes = planet._.svg.append("g").attr("class","lakes").append("path")
        .datum(topojson.feature(_.world, _.world.objects.ne_110m_lakes))
        .attr("d", planet._.path);
        return planet._.lakes;
    }

    var data = [jsonWorld];
    if (tsvCountryNames) {
        data.push(tsvCountryNames);
    }
    return {
        name: 'worldPlugin',
        data: data,
        ready(planet, options, err, world, countryNames) {
            _.world = world;
            _.countryNames = countryNames;
            planet.svgDraw();
        },
        onInit(planet, options) {
            options.world = true;
            options.hideLand = false;
            options.hideCountries = false;
            planet.svgAddWorldOrCountries = svgAddWorldOrCountries;
            planet.svgAddCountries = svgAddCountries;
            planet.svgAddWorld = svgAddWorld;
            planet.svgAddLakes = svgAddLakes;
        },
        onRefresh(planet, options) {
            if (!options.hideLand) {
                if (!options.hideCountries) {
                    planet._.countries.attr("d", planet._.path);
                } else {
                    planet._.world.attr("d", planet._.path);
                }
                planet._.lakes.attr("d", planet._.path);
            }
        },
        countryName(planet, options, d) {
            return _.countryNames.find(function(x) {
                return x.id==d.id;
            })
        }
    };
};

// KoGor’s Block http://bl.ocks.org/KoGor/5994804
//
var countryTooltipPlugin = function() {
    var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

    return {
        name: 'countryTooltipPlugin',
        onInit(planet) {
            var originalsvgAddCountries = planet.svgAddCountries;
            planet.svgAddCountries  = function(planet, options) {
                return originalsvgAddCountries(planet, options)
                .on("mouseover", function(d) {
                    var country = planet.worldPlugin.countryName(d);
                    countryTooltip.text(country.name)
                    .style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .style("display", "block")
                    .style("opacity", 1);
                })
                .on("mouseout", function() {
                    countryTooltip.style("opacity", 0)
                    .style("display", "none");
                })
                .on("mousemove", function() {
                    countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
                });
            };
        },
    }
};

app$1.plugins= {
    versorDragPlugin,
    wheelZoomPlugin,
    oceanPlugin,
    configPlugin,
    graticulePlugin,
    fauxGlobePlugin,
    autorotatePlugin,
    placesPlugin,
    worldPlugin,
    countryTooltipPlugin
};

return app$1;

})));
//# sourceMappingURL=earthjs.js.map
