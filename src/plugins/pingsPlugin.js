export default function() {
    /*eslint no-console: 0 */
    const _ = {svg:null, dataPings: null, ping2: null};

    function svgAddPings() {
        _.svg.selectAll('.pings').remove();
        if (_.dataPings && this._.options.showPings) {
            const g = _.svg.append("g").attr("class","pings");
            _.ping2 = g.selectAll('.ping-2')
                .data(_.dataPings.features).enter().append('circle')
                .attr('class', 'ping-2')
                .attr('id', (d,i) => `ping-${i}`);

            this._.pings = g.selectAll('.ping-2');
            refresh.call(this);
            animate.call(this);
            return this._.pings;
        }
    }

    function animate() {
        var nodes = _.ping2.nodes().filter(d => d.style.display=='inline');
        var node  = nodes[Math.floor(Math.random() * (nodes.length-1))];
        // console.log(node, `#${node.id}`);
        d3.select(`#${node.id}`)
            .attr('r', 2)
            .attr('stroke', '#369')
            .attr('stroke-opacity', 1)
            .attr('stroke-width', '10px')
        .transition()
        .duration(3000)
            .attr('r', 30)
            .attr('fill', 'none')
            .attr('stroke', '#F00')
            .attr('stroke-width', '0px')
            .attr('stroke-opacity', 0);
    }

    function refresh() {
        if (this._.pings && this._.options.showPings) {
            const proj = this._.proj;
            const center = this._.proj.invert(this._.center);
            this._.pings
            .attr('cx', d => proj(d.geometry.coordinates)[0])
            .attr('cy', d => proj(d.geometry.coordinates)[1])
            .style("display", function(d) {
                return d3.geoDistance(d.geometry.coordinates, center) > 1.57 ? 'none' : 'inline';
            });
        }
    }

    return {
        name: 'pingsPlugin',
        onInit() {
            this.svgAddPings = svgAddPings;
            this._.options.showPings = true;
            setInterval(()  => animate.call(this), 5000);
            _.svg = this._.svg;
        },
        onRefresh() {
            refresh.call(this);
        },
        data(data) {
            _.dataPings = data;
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        }
    }
}
