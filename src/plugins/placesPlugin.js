export default function(jsonUrl='./d/places.json') {
    function svgAddPlaces(planet, options) {
        planet.svg.selectAll('.points,.labels').remove();
        if (planet._places) {
            if (options.places && !options.hidePlaces) {
                svgAddPlacePoints(planet, options);
                svgAddPlaceLabels(planet, options);
                position_labels(planet, options);
            }
        }
    }

    function svgAddPlacePoints(planet) {
        planet._.placePoints = planet.svg.append("g").attr("class","points").selectAll("path")
            .data(planet._places.features).enter().append("path")
            .attr("class", "point")
            .attr("d", planet.path);
        return planet._.placePoints;
    }

    function svgAddPlaceLabels(planet) {
        planet._.placeLabels = planet.svg.append("g").attr("class","labels").selectAll("text")
            .data(planet._places.features).enter().append("text")
            .attr("class", "label")
            .text(function(d) { return d.properties.name });
        return planet._.placeLabels;
    }

    function position_labels(planet, options) {
        var centerPos = planet.proj.invert([options.width / 2, options.height/2]);

        planet._.placeLabels
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
            if (planet._.placePoints && options.places) {
                planet._.placePoints.attr("d", planet.path);
                position_labels(planet, options);
            }
        }
    };
}
