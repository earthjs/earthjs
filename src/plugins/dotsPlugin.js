export default function() {
    const _ = {dataDots: null};

    function svgAddDots() {
        if (_.dataDots && this._.options.showDots && !this._.drag) {
            this._.svg.selectAll('.dot').remove();
            if (_.dataDots && this._.options.showDots) {
                const circles = [];
                const circle = d3.geoCircle();
                _.dataDots.features.forEach(function(d) {
                    const coord = d.geometry.coordinates;
                    circles.push(circle.center(coord).radius(0.5)());
                });
                this._.dots = this._.svg.append('g').attr('class','dot').selectAll('path')
                    .data(circles).enter().append('path');
                refresh.call(this);
                return this._.dots;
            }
        }
    }

    function refresh() {
        if (this._.dots && this._.options.showDots) {
            const center = this._.proj.invert(this._.center);
            this._.dots
                .attr('d', this._.path)
                .style('display', function(coord) {
                    return d3.geoDistance(coord, center) > 1.57 ? 'none' : 'inline';
                });
        }
    }

    return {
        name: 'dotsPlugin',
        onInit() {
            this.$.svgAddDots = svgAddDots;
            this._.options.showDots = true;
        },
        onRefresh() {
            refresh.call(this);
        },
        data(data) {
            _.dataDots = data;
        },
    }
}
