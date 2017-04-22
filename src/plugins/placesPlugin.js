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
