export default function() {
    const _ = {dataDots: null};

    function svgAddDots() {
        if (_.dataDots && this._.options.showDots && !this._.drag) {
            this._.svg.selectAll('.dot').remove();
            if (_.dataDots && this._.options.showDots) {
                this._.dots = this._.svg.append("g").attr("class","dot").selectAll('circle')
                    .data(_.dataDots.features).enter().append('circle')
                    .attr('r', 2)
                    .attr('stroke', '#F00')
                    .style('opacity', 0.75);
                refresh.call(this);
                return this._.dots;
            }
        }
    }

    function refresh() {
        if (this._.drag==null) {
            this._.dots.style("display", 'none');
        } else if (!this._.drag && this._.dots && this._.options.showDots) {
            const proj = this._.proj;
            const center = this._.proj.invert(this._.center);
            this._.dots
                .attr('cx', d => proj(d.geometry.coordinates)[0])
                .attr('cy', d => proj(d.geometry.coordinates)[1])
                .style("display", function(d) {
                    return d3.geoDistance(d.geometry.coordinates, center) > 1.57 ? 'none' : 'inline';
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
