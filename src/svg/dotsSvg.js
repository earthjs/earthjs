export default (urlDots, {important}={}) => {
    /*eslint no-console: 0 */
    const _ = {dataDots: null, radiusPath: null};
    const $ = {};

    function init() {
        const __ = this._;
        __.options.showDots = true;
        _.svg = __.svg;
    }

    function create() {
        const __ = this._;
        _.svg.selectAll('.dot').remove();
        if (_.dataDots && __.options.showDots) {
            const circles = [];
            _.circles.forEach(function(d) {
                circles.push(d.circle);
            });
            $.dots = _.svg.append('g').attr('class','dot').selectAll('path')
            .data(circles).enter().append('path');
            if (_.dataDots.geometry) {
                const _g = _.dataDots.geometry || {};
                $.dots
                .style('stroke-width', _g.lineWidth   || 0.2)
                .style('fill',         _g.fillStyle   || 'rgba(100,0,0,.4)')
                .style('stroke',       _g.strokeStyle || 'rgba(119,119,119,.4)')
                .attr('data-index', (d, i) => i);
            }
            refresh.call(this);
        }
    }

    function refresh() {
        const __ = this._;
        let coordinate, gdistance;
        if ($.dots && __.options.showDots) {
            const _g = _.dataDots.geometry || {};
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
        const geoCircle = d3.geoCircle();
        const _g = _.dataDots.geometry || {};
        const _r = _g.radius || 0.5;
        _.circles = _.dataDots.features.map(function(d) {
            const coordinates = d.geometry.coordinates;
            const properties = d.properties;
            const r = d.geometry.radius || _r;
            const circle = geoCircle.center(coordinates).radius(r)();
            return {properties, coordinates, circle};
        });
    }

    return {
        name: 'dotsSvg',
        urls: urlDots && [urlDots],
        onReady(err, dots) {
            _.me.data(dots);
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
        radiusPath(path) {
            _.radiusPath = path;
        },
        data(data) {
            if (data) {
                if (_.radiusPath) {
                    const p = _.radiusPath.split('.');
                    const x = data.features.map(d => {
                        let v = d;
                        p.forEach(o => v = v[o]);
                        return v;
                    }).sort();
                    const scale = d3.scaleLinear()
                        .domain([x[0], x.pop()])
                        .range([0.5, 2]);
                    data.features.forEach(d => {
                        let v = d;
                        p.forEach(o => v = v[o]);
                        d.geometry.radius = scale(v);
                    });
                }
                _.dataDots = data;
                initData();
                setTimeout(() => refresh.call(this),1);
            } else {
                return _.dataDots;
            }
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $dots() {return $.dots;},
    }
}
