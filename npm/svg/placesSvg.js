export default function (urlPlaces) {
    var _ = {svg:null, q: null, places: null};
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showPlaces = true;
        _.svg = __.svg;
    }

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
        var _this = this;
        var centerPos = this._.proj.invert(this._.center);

        $.placeLabels
            .attr('text-anchor',function(d) {
                var x = _this._.proj(d.geometry.coordinates)[0];
                return x < _this._.center[0]-20 ? 'end' :
                       x < _this._.center[0]+20 ? 'middle' :
                       'start'
            })
            .attr('transform', function(d) {
                var loc = _this._.proj(d.geometry.coordinates),
                    x = loc[0],
                    y = loc[1];
                var offset = x < _this._.center[0] ? -5 : 5;
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
        onReady: function onReady(err, places) {
            _.places = places;
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        data: function data(data$1) {
            if (data$1) {
                _.places = data$1;
            } else {
                return _.places;
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $placePoints: function $placePoints() {return $.placePoints;},
        $placeLabels: function $placeLabels() {return $.placeLabels;},
    };
}
