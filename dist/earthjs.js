(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.earthjs = factory());
}(this, (function () { 'use strict';

var app$1 = function (options={}) {
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
    };
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
    planet._.defs = planet.svg.append("defs");
    //----------------------------------------
    planet.resize = resize;
    planet.refresh = refresh;
    planet.svgRecreate = svgRecreate;
    planet.svgCreateOrder = [
        'svgAddGlobeDropShadow',
        'svgAddOcean',
        'svgAddGlobeShading',
        'svgAddWorldOrCountries',
        'svgAddGlobeHilight',
        'svgAddGraticule',
        'svgAddPlaces',
    ];
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
    };
    //----------------------------------------
    // Helper
    planet.scale = function(y) {
        planet.proj.scale(y);
        planet.resize(planet, options);
        planet.refresh(planet, options);
        return planet;
    };

    planet.rotate = function(r) {
        planet.proj.rotate(r);
        planet.refresh(planet, options);
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
            planet.svg.call(d3.drag()
                .on('start', dragstarted)
                .on('end',   dragsended)
                .on('drag',  dragged));

            var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
                r0, // Projection rotation as Euler angles at start.
                q0; // Projection rotation as versor at start.

            function dragstarted() {
                planet.state.drag = true;
                v0 = versor.cartesian(planet.proj.invert(d3.mouse(this)));
                r0 = planet.proj.rotate();
                q0 = versor(r0);
            }

            function dragsended() {
                planet.state.drag = false;
            }

            function dragged() {
                var v1 = versor.cartesian(planet.proj.rotate(r0).invert(d3.mouse(this))),
                    q1 = versor.multiply(q0, versor.delta(v0, v1)),
                    r1 = versor.rotation(q1);
                planet.rotate(r1);
            }
        }
    }
};

var wheelZoomPlugin = function() {
    return {
        name: 'wheelZoomPlugin',
        onInit(planet) {
            planet.svg.on('wheel', function() {
                var y = d3.event.deltaY+ planet.proj.scale();
                // var y = (y>=4 ? y/4 : y) + planet.proj.scale();
                if (y>230 && y<1000) {
                    planet.scale(y);
                }
            });
        }
    }
};

var oceanPlugin = function(initOptions={}) {
    function svgAddOcean(planet, options) {
        planet.svg.selectAll('#ocean,.ocean').remove();
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
            planet.ocean = planet.svg.append("circle")
                .attr("cx",options.width / 2).attr("cy", options.height / 2)
                .attr("r", planet.proj.scale())
                .attr("class", "ocean noclicks")
                .style("fill", "url(#ocean)");
            return planet.ocean;
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
            if (planet.ocean && !options.hideOcean) {
                planet.ocean.attr("r", planet.proj.scale());
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
                planet.state.drag = true;
                planet.svgRecreate(planet);
                planet.state.drag = false;
            }
            return Object.assign({}, options);
        }
    }
};

var graticulePlugin = function(initOptions={}) {
    var datumGraticule = d3.geoGraticule();

    function svgAddGraticule(planet, options) {
        planet.svg.selectAll('.graticule').remove();
        if (!options.hideGraticule) {
            planet._.graticule = planet.svg.append("g").attr("class","graticule").append("path")
                .datum(datumGraticule)
                .attr("class", "noclicks")
                .attr("d", planet.path);
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
                planet._.graticule.attr("d", planet.path);
            }
        },
    }
};

// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
//
var fauxGlobePlugin = function(initOptions={}) {
    function svgAddGlobeDropShadow(planet, options) {
        planet.svg.selectAll('#drop_shadow,.drop_shadow').remove();
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
            planet._.dropShadow = planet.svg.append("ellipse")
                  .attr("cx", options.width/2).attr("cy", options.height-50)
                  .attr("rx", planet.proj.scale()*0.90)
                  .attr("ry", planet.proj.scale()*0.25)
                  .attr("class", "drop_shadow noclicks")
                  .style("fill", "url(#drop_shadow)");
            planet._.dropShadow;
        }
    }

    function svgAddGlobeShading(planet, options) {
        planet.svg.selectAll('#globe_shading,.globe_shading').remove();
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
            planet._.globeShading = planet.svg.append("circle")
                .attr("cx", options.width / 2).attr("cy", options.height / 2)
                .attr("r",  planet.proj.scale())
                .attr("class","globe_shading noclicks")
                .style("fill", "url(#globe_shading)");
            return planet._.globeShading;
        }
    }

    function svgAddGlobeHilight(planet, options) {
        planet.svg.selectAll('#globe_hilight,.globe_hilight').remove();
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
            planet._.globeHilight = planet.svg.append("circle")
                .attr("cx", options.width / 2).attr("cy", options.height / 2)
                .attr("r",  planet.proj.scale())
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
            planet.svgAddGlobeDropShadow = svgAddGlobeDropShadow;
            planet.svgAddGlobeHilight = svgAddGlobeHilight;
            planet.svgAddGlobeShading = svgAddGlobeShading;
        },
        onResize(planet, options) {
            if (planet._.globeShading && !options.hideGlobeShading) {
                planet._.globeShading.attr("r", planet.proj.scale());
            }
            if (planet._.globeHilight && !options.hideGlobeHilight) {
                planet._.globeHilight.attr("r", planet.proj.scale());
            }
        }
    }
};

var autorotatePlugin = function(degPerSec) {
    var lastTick = null;
    return {
        name: 'autorotatePlugin',
        onInit(planet, options) {
            planet.degPerSec = degPerSec;
            options.stop = false;
        },
        onInterval(planet, options) {
            var now = new Date();
            if (planet.state.drag || options.stop || !lastTick) {
                lastTick = now;
            } else {
                var delta = now - lastTick;
                var rotation = planet.proj.rotate();
                rotation[0] += planet.degPerSec * delta / 1000;
                if (rotation[0] >= 180)
                    rotation[0] -= 360;
                planet.proj.rotate(rotation);
                planet.refresh(planet, options);
                lastTick = now;
            }
        },
        speed(planet, options, degPerSec) {
            planet.degPerSec = degPerSec;
        },
        start(planet, options) {
            options.stop = false;
        },
        stop(planet, options) {
            options.stop = true;
        }
    };
};

var placesPlugin = function(jsonUrl='./d/places.json') {
    function svgAddPlaces(planet, options) {
        planet.svg.selectAll('.points,.labels').remove();
        if (planet._places) {
            if (options.places && !options.hidePlaces) {
                svgAddPlacePoints(planet, options);
                svgAddPlaceLabels(planet, options);
                position_labels(planet);
            }
        }
    }

    function svgAddPlacePoints(planet) {
        planet.placePoints = planet.svg.append("g").attr("class","points").selectAll("path")
            .data(planet._places.features).enter().append("path")
            .attr("class", "point")
            .attr("d", planet.path);
        return planet.placePoints;
    }

    function svgAddPlaceLabels(planet) {
        planet.placeLabels = planet.svg.append("g").attr("class","labels").selectAll("text")
            .data(planet._places.features).enter().append("text")
            .attr("class", "label")
            .text(function(d) { return d.properties.name });
        return planet.placeLabels;
    }

    function position_labels(planet) {
        var centerPos = planet.proj.invert([options.width / 2, options.height/2]);

        planet.placeLabels
            .attr("text-anchor",function(d) {
                var x = planet.proj(d.geometry.coordinates)[0];
                return x < options.width/2-20 ? "end" :
                       x < options.width/2+20 ? "middle" :
                       "start"
            })
            .attr("transform", function(d) {
                var loc = planet.proj(d.geometry.coordinates),
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
            planet._places = places;
            planet.svgRecreate(planet);
        },
        onInit(planet, options) {
            options.places = true;
            options.hidePlaces = false;
            planet.svgAddPlaces = svgAddPlaces;
        },
        onRefresh(planet, options) {
            if (planet.placePoints && options.places) {
                planet.placePoints.attr("d", planet.path);
                position_labels(planet);
            }
        }
    };
};

var worldPlugin = function(jsonWorld='./d/world-110m.json', tsvCountryNames) {
    var countryClick = function() {
        // console.log(d);
    };

    function svgAddWorldOrCountries(planet, options) {
        planet.svg.selectAll('.land,.lakes,.countries').remove();
        if (!options.hideLand) {
            if (planet._world) {
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
        planet._.countries = planet.svg.append("g").attr("class","countries").selectAll("path")
        .data(topojson.feature(planet._world, planet._world.objects.countries).features)
        .enter().append("path").attr("id",function(d) {return 'x'+d.id})
        .on('click', countryClick)
        .attr("d", planet.path);
        return planet._.countries;
    }

    function svgAddWorld(planet) {
        planet._.world = planet.svg.append("g").attr("class","land").append("path")
        .datum(topojson.feature(planet._world, planet._world.objects.land))
        .attr("d", planet.path);
        return planet._.world;
    }

    function svgAddLakes(planet) {
        planet._.lakes = planet.svg.append("g").attr("class","lakes").append("path")
        .datum(topojson.feature(planet._world, planet._world.objects.ne_110m_lakes))
        .attr("d", planet.path);
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
            planet._world = world;
            planet._countryNames = countryNames;
            planet.svgRecreate(planet);
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
                    planet._.countries.attr("d", planet.path);
                } else {
                    planet._.world.attr("d", planet.path);
                }
                planet._.lakes.attr("d", planet.path);
            }
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
                originalsvgAddCountries(planet, options)
                .on("mouseover", function(d) {
                    var country = planet._countryNames.find(function(x) {
                        return x.id==d.id;
                    });
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
                return planet._.countries;
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
