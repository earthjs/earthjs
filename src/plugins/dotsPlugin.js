export default urlDots => {
    const _ = {dataDots: null};
    const $ = {};

    function svgAddDots() {
        const __ = this._;
        if (_.dataDots && __.options.showDots && !__.drag) {
            __.svg.selectAll('.dot').remove();
            if (_.dataDots && __.options.showDots) {
                const circles = [];
                _.circles.forEach(function(d) {
                    circles.push(d.circle);
                });
                $.dots = __.svg.append('g').attr('class','dot').selectAll('path')
                .data(circles).enter().append('path');
                if (_.dataDots.geometry) {
                    const _g = _.dataDots.geometry;
                    _g.lineWidth   && $.dots.style('stroke-width', _g.lineWidth);
                    _g.fillStyle   && $.dots.style('fill',         _g.fillStyle);
                    _g.strokeStyle && $.dots.style('stroke',       _g.strokeStyle);
                }
                refresh.call(this);
            }
        }
    }

    function refresh() {
        const __ = this._;
        if ($.dots && __.options.showDots) {
            $.dots.attr('d', __.path).style('display', function(d) {
                return d3.geoDistance(d.coordinates, __.proj.invert(__.center)) > 1.57 ? 'none' : 'inline';
            });
        }
    }

    function initData() {
        const geoCircle = d3.geoCircle();
        const _g = _.dataDots.geometry || {};
        const _r = _g.radius || 0.5;
        _.circles = _.dataDots.features.map(function(d) {
            const coordinates = d.geometry.coordinates;
            const r = d.geometry.radius || _r;
            const circle = geoCircle.center(coordinates).radius(r)();
            return {coordinates, circle};
        });
    }

    return {
        name: 'dotsPlugin',
        urls: urlDots && [urlDots],
        onReady(err, dots) {
            this.dotsPlugin.data(dots);
        },
        onInit() {
            this.$fn.svgAddDots = svgAddDots;
            this._.options.showDots = true;
        },
        onRefresh() {
            refresh.call(this);
        },
        data(data) {
            if (data) {
                _.dataDots = data;
                initData();
                setTimeout(() => refresh.call(this),1);
            } else {
                return _.dataDots;
            }
        },
    }
}
