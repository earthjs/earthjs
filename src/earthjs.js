window.earthjs = function(){
    var earthjs = null;
    if (window) originalEarthjs = window.earthjs;

    earthjs = function (options={}) {
        options = Object.assign({
            world: './d/world-110m.json',
            select: '#earth',
            drawTick: 50,
            width: 960,
            height: 500,
            world: null,
            places: null,
            graticule: null,
            showOcean: true,
            showPlaces: true,
            showCountries: true,
            showGraticule: true,
            showGlobeShadow: true,
            showGlobeShading: true,
            globeHighlighted: true,
        }, options);
        var _ = {
            onDraw: {},
            onRefresh: {},
            onDrawKeys: [],
            onRefreshKeys: [],
        };
        var svg =  d3.select(options.select).attr("width", options.width).attr("height", options.height);
        var proj = d3.geo.orthographic().scale(220).translate([options.width / 2, options.height / 2]).clipAngle(90);
        var path = d3.geo.path().projection(proj).pointRadius(1.5);
        var planet = {
            svg,
            proj,
            path,
            fn: {},
            loaded: false,
            state: {drag: false},
            width: options.width,
            height: options.height,
            datumGraticule: d3.geo.graticule(),
            ready: ()=>{},
            register: function(obj) {
                if (obj.onInterval) {
                    _.onDraw[obj.name] = obj.onInterval;
                    _.onDrawKeys = Object.keys(_.onDraw);
                }
                if (obj.onRefresh) {
                    _.onRefresh[obj.name] = obj.onRefresh;
                    _.onRefreshKeys = Object.keys(_.onRefresh);
                }
                if (typeof(obj.fn)=='function') {
                    planet.fn[obj.name] = function() {
                        var args = [].slice.call(arguments);
                        args.unshift(planet, options);
                        obj.fn.apply(null, args);
                    }
                }
                if (obj.json && obj.ready) {
                    queue().defer(d3.json, obj.json).await(function(err, data) {
                        obj.ready(planet, options, err, data);
                    });
                }
            }
        };
        var q = queue()
            .defer(d3.json, options.world);

        if (options.places) {
            q.defer(d3.json, options.places);
        }
        q.await(ready);

        addGlobeDropShadow(planet, options);
        addOcean(planet, options);

        setInterval(function(){
            if (_.onDrawKeys.length>0) {
                _.onDrawKeys.map(function(key, index) {
                    _.onDraw[key](planet, options);
                });
            }
        }, options.drawTick);
        //----------------------------------------
        rotateEarth(planet, options);
        planet.addPlaces = addPlaces;
        planet.refresh = refresh;
        return planet;
        //----------------------------------------
        function ready(error, world, places) {
            planet._world = world, planet._places = places;
            addWorldOrCountries(planet, options);
            addPlaces(planet, options);

            addGlobeHighlight(planet, options);
            addGlobeShading(planet, options);
            addGraticule(planet, options);

            planet.loaded = true;
            planet.ready.call(planet);
        }

        function refresh(planet, options) {
            if (options.showCountries) {
                planet.countries.attr("d", planet.path);
            } else {
                planet.world.attr("d", planet.path);
            }
            if (planet.graticule && options.showGraticule) {
                planet.graticule.attr("d", planet.path);
            }
            if (planet.points && options.places && options.places) {
                planet.points.attr("d", planet.path);
                position_labels(planet);
            }
            if (_.onRefreshKeys.length>0) {
                _.onRefreshKeys.map(function(key, index) {
                    _.onRefresh[key](planet, options);
                });
            }
        }
    };

    //=============================================

    function position_labels(planet) {
      var centerPos = planet.proj.invert([planet.width / 2, planet.height/2]);
      var arc = d3.geo.greatArc();

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
          var d = arc.distance({source: d.geometry.coordinates, target: centerPos});
          return (d > 1.57) ? 'none' : 'inline';
        })
    }

    // events
    function rotateEarth(planet, options) {
        var win = d3.select(window);
        win.on("mouseup",   mouseup);
        win.on("mousemove", mousemove);
        planet.svg.on("mousedown", mousedown);

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
    }

    // add svg element
    function addWorldOrCountries(planet, options) {
        planet.svg.selectAll('.land,.countries').remove();
        if (options.showCountries) {
            planet.countries = planet.svg.append("g").attr("class","countries").selectAll("path")
            .data(topojson.feature(planet._world, planet._world.objects.countries).features).enter().append("path")
            .attr("d", planet.path);
        } else {
            planet.world = planet.svg.append("path")
            .datum(topojson.feature(planet._world, planet._world.objects.land))
            .attr("class", "land")
            .attr("d", planet.path);
        }
    }

    function addPlaces(planet, options) {
        planet.svg.selectAll('.points,.labels').remove();
        if (options.places && options.showPlaces) {
            planet.points = planet.svg.append("g").attr("class","points").selectAll("text").data(planet._places.features).enter().append("path")
                .attr("class", "point")
                .attr("d", planet.path);
            planet.labels = planet.svg.append("g").attr("class","labels").selectAll("text").data(planet._places.features).enter().append("text")
                .attr("class", "label")
                .text(function(d) { return d.properties.name });
            position_labels(planet);
        }
    }

    function addOcean(planet, options) {
        planet.svg.selectAll('.ocean_fill,.ocean_fill_circle').remove();
        if (options.showOcean) {
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

    function addGlobeHighlight(planet, options) {
        planet.svg.selectAll('.globe_highlight,.globe_highlight_circle').remove();
        if (options.globeHighlighted) {
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

    function addGlobeShading(planet, options) {
        planet.svg.selectAll('.globe_shading,.globe_shading_circle').remove();
        if (options.showGlobeShading) {
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

    function addGraticule(planet, options) {
        planet.svg.selectAll('.graticule').remove();
        if (options.showGraticule) {
            planet.graticule = planet.svg.append("path").datum(planet.datumGraticule)
            .attr("class", "graticule noclicks")
            .attr("d", planet.path);
        }
    }

    function addGlobeDropShadow(planet, options) {
        planet.svg.selectAll('.drop_shadow,.drop_shadow_ellipse').remove();
        if (options.showGlobeShadow) {
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
                  .attr("cx", 440).attr("cy", 450)
                  .attr("rx", planet.proj.scale()*.90)
                  .attr("ry", planet.proj.scale()*.25)
                  .attr("class", "drop_shadow_ellipse noclicks")
                  .style("fill", "url(#drop_shadow)");
        }
    }

    // Internal plugins
    earthjs.plugins = {};
    earthjs.plugins.configPlugin = function() {
        return {
            name: 'config',
            fn(planet, options, newOpt={}) {
                planet.state.drag = true;
                if (newOpt.showOcean!==undefined) {
                    options.showOcean = newOpt.showOcean;
                    planet.svg.selectAll('#ocean_fill')
                    .style("opacity", newOpt.showOcean ? 1 : 0);
                }
                if (newOpt.showCountries!==undefined) {
                    options.showCountries = newOpt.showCountries;
                    addWorldOrCountries(planet, options);
                    addGlobeHighlight(planet, options);
                    addGlobeShading(planet, options);
                    addGraticule(planet, options);
                }
                if (options.places && newOpt.showPlaces!==undefined) {
                    planet.svg.selectAll('.points,.labels').remove();
                    options.showPlaces = newOpt.showPlaces;
                    if (options.places && newOpt.showPlaces) {
                        addPlaces(planet, options);
                    }
                }
                planet.state.drag = false;
            }
        }
    };

    earthjs.plugins.autorotatePlugin = function(degPerSec) {
        var lastTick = null;
        return {
            name: 'autorotate',
            onInterval(planet, options) {
                var now = new Date();
                if (planet.state.drag || !lastTick) {
                    lastTick = now;
                } else {
                    var delta = now - lastTick;
                    var rotation = planet.proj.rotate();
                    rotation[0] += degPerSec * delta / 1000;
                    if (rotation[0] >= 180)
                        rotation[0] -= 360;
                    planet.proj.rotate(rotation);
                    planet.refresh(planet, options);
                    lastTick = now;
                }
            }
        };
    };

    earthjs.plugins.placesPlugin = function(jsonUrl='./d/places.json') {
        return {
            name: 'places',
            json: jsonUrl,
            ready(planet, options, err, places) {
                options.places = true;
                planet._places = places;
                planet.svg.selectAll('.points,.labels').remove();
                planet.addPlaces(planet, options);
            },
            onInterval(planet, options) {
                //code...
            },
            onRefresh(planet, options) {
                // console.log(0);
                // code...
            },
            fn(planet, options, args={}) {
                //code...
            }
        };
    };

    earthjs.noConflict = function() {
        window.earthjs = originalEarthjs;
        return earthjs;
    };
    return earthjs;
}();
