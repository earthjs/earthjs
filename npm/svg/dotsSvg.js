export default function (urlDots, ref) {
    if ( ref === void 0 ) ref={};
    var important = ref.important;

    /*eslint no-console: 0 */
    var _ = {dataDots: null, radiusPath: null};
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showDots = true;
        _.svg = __.svg;
    }

    function create() {
        var __ = this._;
        _.svg.selectAll('.dot').remove();
        if (_.dataDots && __.options.showDots) {
            var circles = [];
            _.circles.forEach(function(d) {
                circles.push(d.circle);
            });
            $.dots = _.svg.append('g').attr('class','dot').selectAll('path')
            .data(circles).enter().append('path');
            if (_.dataDots.geometry) {
                var _g = _.dataDots.geometry || {};
                $.dots
                .style('stroke-width', _g.lineWidth   || 0.2)
                .style('fill',         _g.fillStyle   || 'rgba(100,0,0,.4)')
                .style('stroke',       _g.strokeStyle || 'rgba(119,119,119,.4)')
                .attr('data-index', function (d, i) { return i; });
            }
            refresh.call(this);
        }
    }

    function refresh() {
        var __ = this._;
        var coordinate, gdistance;
        if ($.dots && __.options.showDots) {
            var _g = _.dataDots.geometry || {};
            if (__.options.transparent || __.options.transparentDots) {
                __.proj.clipAngle(180);
                $.dots.style('fill', function(d, i) {
                    coordinate = d.coordinates[0][i];
                    gdistance = d3.geoDistance(coordinate, __.proj.invert(__.center));
                    return gdistance > 1.57 ? 'none' : (_g.fillStyle || 'rgba(100,0,0,.4)');
                });
                $.dots.style('display', function() {
                    return (__.drag && !important) ? 'none' : 'inline';
                });
                $.dots.attr('d', __.path);
                __.proj.clipAngle(90);
            } else {
                $.dots.style('display', function(d, i) {
                    coordinate = d.coordinates[0][i];
                    gdistance = d3.geoDistance(coordinate, __.proj.invert(__.center));
                    return (gdistance > 1.57 || (__.drag && !important)) ? 'none' : 'inline';
                });
                $.dots.style('fill', _g.fillStyle   || 'rgba(100,0,0,.4)')
                $.dots.attr('d', __.path);
            }
        }
    }

    function initData() {
        var geoCircle = d3.geoCircle();
        var _g = _.dataDots.geometry || {};
        var _r = _g.radius || 0.5;
        _.circles = _.dataDots.features.map(function(d) {
            var coordinates = d.geometry.coordinates;
            var properties = d.properties;
            var r = d.geometry.radius || _r;
            var circle = geoCircle.center(coordinates).radius(r)();
            return {properties: properties, coordinates: coordinates, circle: circle};
        });
    }

    return {
        name: 'dotsSvg',
        urls: urlDots && [urlDots],
        onReady: function onReady(err, dots) {
            _.me.data(dots);
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
        radiusPath: function radiusPath(path) {
            _.radiusPath = path;
        },
        data: function data(data$1) {
            var this$1 = this;

            if (data$1) {
                if (_.radiusPath) {
                    var p = _.radiusPath.split('.');
                    var x = data$1.features.map(function (d) {
                        var v = d;
                        p.forEach(function (o) { return v = v[o]; });
                        return v;
                    }).sort();
                    var scale = d3.scaleLinear()
                        .domain([x[0], x.pop()])
                        .range([0.5, 2]);
                    data$1.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) { return v = v[o]; });
                        d.geometry.radius = scale(v);
                    });
                }
                _.dataDots = data$1;
                initData();
                setTimeout(function () { return refresh.call(this$1); },1);
            } else {
                return _.dataDots;
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $dots: function $dots() {return $.dots;},
    }
}
