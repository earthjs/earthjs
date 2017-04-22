window.earthjs = function(){
    var earthjs = null;
    if (window) originalEarthjs = window.earthjs;

    earthjs = function (options={}) {
        options = Object.assign({
            select: '#earth',
            drawTick: 50,
            height: 560,
            width: 960,
        }, options);
        var _ = {
            onInterval: {},
            onRefresh: {},
            onIntervalKeys: [],
            onRefreshKeys: [],
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
                    if (['onInterval', 'onRefresh', 'ready', 'json'].indexOf(name)===-1) {
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
                if (obj.onInterval) {
                    _.onInterval[obj.name] = obj.onInterval;
                    _.onIntervalKeys = Object.keys(_.onInterval);
                }
                if (obj.onRefresh) {
                    _.onRefresh[obj.name] = obj.onRefresh;
                    _.onRefreshKeys = Object.keys(_.onRefresh);
                }
                if (obj.json && obj.ready) {
                    queue().defer(d3.json, obj.json).await(function(err, data) {
                        obj.ready(planet, options, err, data);
                    });
                }
                return planet;
            }
        };
        //----------------------------------------
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
    };

    //=============================================
    // Internal plugins
    earthjs.plugins = {};
    earthjs.plugins.configPlugin = function() {
        return {
            name: 'configPlugin',
            set(planet, options, newOpt={}) {
                Object.assign(options, newOpt);
                planet.state.drag = true;
                planet.recreateSvg(planet);
                planet.state.drag = false;
            }
        }
    };
    // events
    earthjs.plugins.dragPlugin = function(degPerSec) {
        return {
            name: 'dragPlugin',
            onInit(planet, options) {
                var m0, o0;

                function mousedown() {
                  m0 = [d3.event.pageX, d3.event.pageY];
                  o0 = planet.proj.rotate();
                  planet.state.drag = true;
                  d3.event.preventDefault();
                }

                function mousemove() {
                  if (m0) {
                    var m1 = [d3.event.pageX, d3.event.pageY]
                      , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
                    o1[1] = o1[1] > 30  ? 30  :
                            o1[1] < -30 ? -30 :
                            o1[1];
                    planet.proj.rotate(o1);
                    planet.refresh(planet, options);
                  }
                }

                function mouseup() {
                  if (m0) {
                    mousemove();
                    m0 = null;
                    planet.state.drag = false;
                  }
                }

                var win = d3.select(window);
                win.on("mouseup",   mouseup);
                win.on("mousemove", mousemove);
                planet.svg.on("mousedown", mousedown);
            },
        }
    }

    earthjs.plugins.autorotatePlugin = function(degPerSec) {
        var lastTick = null;
        return {
            name: 'autorotatePlugin',
            onInit(planet, options) {
                planet.degPerSec = degPerSec;
            },
            onInterval(planet, options) {
                var now = new Date();
                if (planet.state.drag || !lastTick) {
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
                planet.state.drag = false;
            },
            stop(planet, options) {
                planet.state.drag = true;
            }
        };
    };

    earthjs.plugins.worldPlugin = function(jsonUrl='./d/world-110m.json') {
        function addWorldOrCountries(planet, options) {
            if (!options.hideLand) {
                planet.svg.selectAll('.land,.countries').remove();
                if (planet._world) {
                    planet.svg.selectAll('.land,.countries').remove();
                    if (!options.hideCountries) {
                        planet.countries = planet.svg.append("g").attr("class","countries").selectAll("path")
                        .data(topojson.feature(planet._world, planet._world.objects.countries).features)
                        .enter().append("path").attr("d", planet.path);
                    } else {
                        planet.world = planet.svg.append("path")
                        .datum(topojson.feature(planet._world, planet._world.objects.land))
                        .attr("class", "land")
                        .attr("d", planet.path);
                    }
                }
            }
        }

        return {
            name: 'worldPlugin',
            json: jsonUrl,
            ready(planet, options, err, world) {
                planet._world = world;
                planet.recreateSvg(planet);
            },
            onInit(planet, options) {
                options.world = true;
                options.hideLand = false;
                options.hideCountries = false;
                planet.addWorldOrCountries = addWorldOrCountries;
            },
            onRefresh(planet, options) {
                if (!options.hideCountries) {
                    planet.countries.attr("d", planet.path);
                } else {
                    planet.world.attr("d", planet.path);
                }
            }
        };
    };

    earthjs.plugins.placesPlugin = function(jsonUrl='./d/places.json') {
        function position_labels(planet) {
            var centerPos = planet.proj.invert([planet.width / 2, planet.height/2]);

            planet.svg.selectAll(".label")
                .attr("text-anchor",function(d) {
                    var x = planet.proj(d.geometry.coordinates)[0];
                    return x < planet.width/2-20 ? "end" :
                           x < planet.width/2+20 ? "middle" :
                           "start"
                })
                .attr("transform", function(d) {
                    var loc = planet.proj(d.geometry.coordinates),
                        x = loc[0],
                        y = loc[1];
                    var offset = x < planet.width/2 ? -5 : 5;
                    return "translate(" + (x+offset) + "," + (y-2) + ")"
                })
                .style("display", function(d) {
                    return d3.geoDistance(d.geometry.coordinates, centerPos) > 1.57 ? 'none' : 'inline';
                });
        };

        function addPlaces(planet, options) {
            if (planet._places) {
                planet.svg.selectAll('.points,.labels').remove();
                if (options.places && !options.hidePlaces) {
                    planet.points = planet.svg.append("g").attr("class","points").selectAll("text").data(planet._places.features).enter().append("path")
                        .attr("class", "point")
                        .attr("d", planet.path);
                    planet.labels = planet.svg.append("g").attr("class","labels").selectAll("text").data(planet._places.features).enter().append("text")
                        .attr("class", "label")
                        .text(function(d) { return d.properties.name });
                    position_labels(planet);
                }
            }
        }

        return {
            name: 'placesPlugin',
            json: jsonUrl,
            ready(planet, options, err, places) {
                planet._places = places;
                planet.recreateSvg(planet);
            },
            onInit(planet, options) {
                options.places = true;
                options.hidePlaces = false;
                planet.addPlaces = addPlaces;
            },
            onRefresh(planet, options) {
                if (planet.points && options.places && options.places) {
                    planet.points.attr("d", planet.path);
                    position_labels(planet);
                }
            }
        };
    };
    earthjs.plugins.oceanPlugin = function(initOptions={}) {
        initOptions = Object.assign({
            hideOcean: false,
        }, initOptions);

        function addOcean(planet, options) {
            planet.svg.selectAll('#ocean_fill,.ocean_fill_circle').remove();
            if (!options.hideOcean) {
                var ocean_fill = planet.svg.append("defs").append("radialGradient")
                    .attr("id", "ocean_fill")
                    .attr("cx", "75%")
                    .attr("cy", "25%");
                ocean_fill.append("stop")
                    .attr("offset", "5%")
                    .attr("stop-color", "#ddf");
                ocean_fill.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "#9ab");
                planet.svg.append("circle")
                    .attr("cx", planet.width / 2).attr("cy", planet.height / 2)
                    .attr("r",  planet.proj.scale())
                    .attr("class", "ocean_fill_circle noclicks")
                    .style("fill", "url(#ocean_fill)");
            }
        }

        return {
            name: 'oceanPlugin',
            onInit(planet, options) {
                Object.assign(options, initOptions);
                planet.addOcean = addOcean;
            },
        }
    }

    earthjs.plugins.graticulePlugin = function(initOptions={}) {
        initOptions = Object.assign({
            hideGraticule: false,
        }, initOptions);

        function addGraticule(planet, options) {
            planet.svg.selectAll('.graticule').remove();
            if (!options.hideGraticule) {
                planet.graticule = planet.svg.append("path").datum(planet.datumGraticule)
                .attr("class", "graticule noclicks")
                .attr("d", planet.path);
            }
        }

        return {
            name: 'graticulePlugin',
            onInit(planet, options) {
                planet.datumGraticule = d3.geoGraticule();
                Object.assign(options, initOptions);
                planet.addGraticule = addGraticule;
            },
            onRefresh(planet, options) {
                if (planet.graticule && !options.hideGraticule) {
                    planet.graticule.attr("d", planet.path);
                }
            },
        }
    }

    earthjs.plugins.fauxGlobePlugin = function(initOptions={}) {
        initOptions = Object.assign({
            hideGlobeShadow: false,
            hideGlobeShading: false,
            hideGlobeHilight: false,
        }, initOptions);

        function addGlobeDropShadow(planet, options) {
            planet.svg.selectAll('.drop_shadow,.drop_shadow_ellipse').remove();
            if (!options.hideGlobeShadow) {
                var drop_shadow = planet.svg.append("defs").append("radialGradient")
                      .attr("id", "drop_shadow")
                      .attr("cx", "50%")
                      .attr("cy", "50%");
                    drop_shadow.append("stop")
                      .attr("offset","20%").attr("stop-color", "#000")
                      .attr("stop-opacity",".5")
                    drop_shadow.append("stop")
                      .attr("offset","100%").attr("stop-color", "#000")
                      .attr("stop-opacity","0")
                planet.svg.append("ellipse")
                      .attr("cx", planet.width/2).attr("cy", planet.height-50)
                      .attr("rx", planet.proj.scale()*.90)
                      .attr("ry", planet.proj.scale()*.25)
                      .attr("class", "drop_shadow_ellipse noclicks")
                      .style("fill", "url(#drop_shadow)");
            }
        }

        function addGlobeShading(planet, options) {
            planet.svg.selectAll('#globe_shading,.globe_shading_circle').remove();
            if (!options.hideGlobeShading) {
                var globe_shading = planet.svg.append("defs").append("radialGradient")
                      .attr("id", "globe_shading")
                      .attr("cx", "50%")
                      .attr("cy", "40%");
                    globe_shading.append("stop")
                      .attr("offset","50%").attr("stop-color", "#9ab")
                      .attr("stop-opacity","0")
                    globe_shading.append("stop")
                      .attr("offset","100%").attr("stop-color", "#3e6184")
                      .attr("stop-opacity","0.3")
                planet.svg.append("circle")
                    .attr("cx", planet.width / 2).attr("cy", planet.height / 2)
                    .attr("r",  planet.proj.scale())
                    .attr("class","globe_shading_circle noclicks")
                    .style("fill", "url(#globe_shading)");
            }
        }

        function addGlobeHilight(planet, options) {
            planet.svg.selectAll('#globe_highlight,.globe_highlight_circle').remove();
            if (!options.hideGlobeHilight) {
                var globe_highlight = planet.svg.append("defs").append("radialGradient")
                      .attr("id", "globe_highlight")
                      .attr("cx", "75%")
                      .attr("cy", "25%");
                    globe_highlight.append("stop")
                      .attr("offset", "5%").attr("stop-color", "#ffd")
                      .attr("stop-opacity","0.6");
                    globe_highlight.append("stop")
                      .attr("offset", "100%").attr("stop-color", "#ba9")
                      .attr("stop-opacity","0.2");
                planet.svg.append("circle")
                    .attr("cx", planet.width / 2).attr("cy", planet.height / 2)
                    .attr("r",  planet.proj.scale())
                    .attr("class","globe_highlight_circle noclicks")
                    .style("fill", "url(#globe_highlight)");
            }
        }

        return {
            name: 'fauxGlobePlugin',
            onInit(planet, options) {
                Object.assign(options, initOptions);
                planet.addGlobeDropShadow = addGlobeDropShadow;
                planet.addGlobeHilight = addGlobeHilight;
                planet.addGlobeShading = addGlobeShading;
            },
        }
    };

    earthjs.noConflict = function() {
        window.earthjs = originalEarthjs;
        return earthjs;
    };
    return earthjs;
}();
