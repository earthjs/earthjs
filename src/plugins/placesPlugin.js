export default function(jsonUrl='./d/places.json') {
    var _ = {svg:null, places: null, select: null};

    function svgAddPlaces(planet, options) {
        _.svg.selectAll('.points,.labels').remove();
        if (_.places) {
            if (options.places && !options.hidePlaces) {
                svgAddPlacePoints(planet, options);
                svgAddPlaceLabels(planet, options);
                position_labels(planet, options);
            }
        }
    }

    function svgAddPlacePoints(planet) {
        planet._.placePoints = _.svg.append("g").attr("class","points").selectAll("path")
            .data(_.places.features).enter().append("path")
            .attr("class", "point")
            .attr("d", planet._.path);
        return planet._.placePoints;
    }

    function svgAddPlaceLabels(planet) {
        planet._.placeLabels = _.svg.append("g").attr("class","labels").selectAll("text")
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
            _.svg = planet._.svg;
        },
        onRefresh(planet, options) {
            if (planet._.placePoints && options.places) {
                planet._.placePoints.attr("d", planet._.path);
                position_labels(planet, options);
            }
        },
        select(planet, options, slc) {
            _.select = slc;
            _.svg = d3.selectAll(slc);
        }
    };
}
