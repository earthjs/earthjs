export default function(urlPlaces) {
    var _ = {svg:null, select: null, places: null};

    function svgAddPlaces() {
        _.svg.selectAll('.points,.labels').remove();
        if (_.places) {
            if (this._.options.showPlaces) {
                svgAddPlacePoints.call(this);
                svgAddPlaceLabels.call(this);
                position_labels.call(this);
            }
        }
    }

    function svgAddPlacePoints() {
        this._.placePoints = _.svg.append("g").attr("class","points").selectAll("path")
            .data(_.places.features).enter().append("path")
            .attr("class", "point")
            .attr("d", this._.path);
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
        var _this = this;
        var centerPos = this._.proj.invert([this._.options.width / 2, this._.options.height/2]);

        this._.placeLabels
            .attr("text-anchor",function(d) {
                var x = _this._.proj(d.geometry.coordinates)[0];
                return x < _this._.options.width/2-20 ? "end" :
                       x < _this._.options.width/2+20 ? "middle" :
                       "start"
            })
            .attr("transform", function(d) {
                var loc = _this._.proj(d.geometry.coordinates),
                    x = loc[0],
                    y = loc[1];
                var offset = x < _this._.options.width/2 ? -5 : 5;
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
            this.svgDraw();
        },
        onInit() {
            this._.options.showPlaces = true;
            this.svgAddPlaces = svgAddPlaces;
            _.svg = this._.svg;
        },
        onRefresh() {
            if (this._.placePoints) {
                this._.placePoints.attr("d", this._.path);
                position_labels.call(this);
            }
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        },
        data(p) {
            if (p) {
                var data = p.placesPlugin.data()
                _.places = data.places;
            } else {
                return {places: _.places}
            }
        }
    };
}
