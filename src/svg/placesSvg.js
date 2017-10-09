export default urlPlaces => {
    const _ = {svg:null, q: null, places: null};
    const $ = {};

    function init() {
        const __ = this._;
        __.options.showPlaces = true;
        _.svg = __.svg;
    }

    function create() {
        const klas = _.me.name;
        _.svg.selectAll(`.points.${klas},.labels.${klas}`).remove();
        if (_.places) {
            if (this._.options.showPlaces) {
                svgAddPlacePoints.call(this);
                svgAddPlaceLabels.call(this);
                refresh.call(this);
            }
        }
    }

    function svgAddPlacePoints() {
        const klas = _.me.name;
        $.placePoints = _.svg.append('g').attr('class',`points ${klas}`).selectAll('path')
            .data(_.places.features).enter().append('path')
            .attr('class', 'point');
    }

    function svgAddPlaceLabels() {
        const klas = _.me.name;
        $.placeLabels = _.svg.append('g').attr('class',`labels ${klas}`).selectAll('text')
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

    function refresh() {
        if ($.placePoints) {
            $.placePoints.attr('d', this._.path);
            position_labels.call(this);
        }
    }

    return {
        name: 'placesSvg',
        urls: urlPlaces && [urlPlaces],
        onReady(err, places) {
            _.places = places;
        },
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        data(data) {
            if (data) {
                _.places = data;
            } else {
                return _.places;
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
