export default function(urlPlaces) {
    const _ = {svg:null, q: null, places: null};

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
        this._.placePoints = _.svg.append("g").attr("class","points").selectAll("path")
            .data(_.places.features).enter().append("path")
            .attr("class", "point");
        return this._.placePoints;
    }

    function svgAddPlaceLabels() {
        this._.placeLabels = _.svg.append("g").attr("class","labels").selectAll("text")
            .data(_.places.features).enter().append("text")
            .attr("class", "label")
            .text(function(d) { return d.properties.name });
        return this._.placeLabels;
    }

    function position_labels() {
        const _this = this;
        const centerPos = this._.proj.invert(this._.center);

        this._.placeLabels
            .attr("text-anchor",function(d) {
                const x = _this._.proj(d.geometry.coordinates)[0];
                return x < _this._.center[0]-20 ? "end" :
                       x < _this._.center[0]+20 ? "middle" :
                       "start"
            })
            .attr("transform", function(d) {
                const loc = _this._.proj(d.geometry.coordinates),
                    x = loc[0],
                    y = loc[1];
                const offset = x < _this._.center[0] ? -5 : 5;
                return "translate(" + (x+offset) + "," + (y-2) + ")"
            })
            .style("display", function(d) {
                return d3.geoDistance(d.geometry.coordinates, centerPos) > 1.57 ? 'none' : 'inline';
            });
    }

    return {
        name: 'placesPlugin',
        urls: urlPlaces && [urlPlaces],
        onReady(err, places) {
            _.places = places;
        },
        onInit() {
            this.$.svgAddPlaces = svgAddPlaces;
            this._.options.showPlaces = true;
            _.svg = this._.svg;
        },
        onRefresh() {
            refresh.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        data(p) {
            if (p) {
                const data = p.placesPlugin.data()
                _.places = data.places;
            } else {
                return {places: _.places}
            }
        }
    };
}
