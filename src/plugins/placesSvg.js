export default (urlPlaces, selector) => {
    const _ = {svg:null, q: null, places: null};
    const $ = {};

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

    function refresh() {
        if ($.placePoints) {
            $.placePoints.attr('d', this._.path);
            position_labels.call(this);
        }
    }

    function svgAddPlacePoints() {
        $.placePoints = _.svg.append('g').attr('class','points').selectAll('path')
            .data(_.places.features).enter().append('path')
            .attr('class', 'point');
    }

    function svgAddPlaceLabels() {
        $.placeLabels = _.svg.append('g').attr('class','labels').selectAll('text')
            .data(_.places.features).enter().append('text')
            .attr('class', 'label')
            .text(function(d) { return d.properties.name });
    }

    function position_labels() {
        const _this = this;
        const centerPos = this._.proj.invert(this._.center);

        $.placeLabels
            .attr('text-anchor',function(d) {
                const x = _this._.proj(d.geometry.coordinates)[0];
                return x < _this._.center[0]-20 ? 'end' :
                       x < _this._.center[0]+20 ? 'middle' :
                       'start'
            })
            .attr('transform', function(d) {
                const loc = _this._.proj(d.geometry.coordinates),
                    x = loc[0],
                    y = loc[1];
                const offset = x < _this._.center[0] ? -5 : 5;
                return 'translate(' + (x+offset) + ',' + (y-2) + ')'
            })
            .style('display', function(d) {
                return d3.geoDistance(d.geometry.coordinates, centerPos) > 1.57 ? 'none' : 'inline';
            });
    }

    return {
        name: 'placesSvg',
        urls: urlPlaces && [urlPlaces],
        onReady(err, places) {
            _.places = places;
        },
        onInit() {
            const __ = this._;
            __.options.showPlaces = true;
            _.svg = selector ? d3.selectAll(selector) : __.svg;
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        data(p) {
            if (p) {
                const data = p.placesSvg.data()
                _.places = data.places;
            } else {
                return {places: _.places}
            }
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $placePoints() {return $.placePoints;},
        $placeLabels() {return $.placeLabels;},
    };
}
