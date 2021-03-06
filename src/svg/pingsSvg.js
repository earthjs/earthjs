export default () => {
    /*eslint no-console: 0 */
    const _ = {svg:null, dataPings: null};
    const $ = {};

    function init() {
        const __ = this._;
        __.options.showPings = true;
        setInterval(() => animate.call(this), 3000);
        _.svg = __.svg;
    }

    function create() {
        const klas = _.me.name;
        _.svg.selectAll(`.pings.${klas}`).remove();
        if (_.dataPings && this._.options.showPings) {
            const g = _.svg.append('g').attr('class',`pings ${klas}`);
            $.ping2 = g.selectAll('.ping-2')
                .data(_.dataPings.features).enter().append('circle')
                .attr('class', 'ping-2')
                .attr('id', (d,i) => `ping-${i}`);

            $.pings = g.selectAll('.ping-2');
            refresh.call(this);
            animate.call(this);
        }
    }

    function animate() {
        const nodes = $.ping2.nodes().filter(d => d.style.display=='inline');
        if (nodes.length>0) {
            d3.select(`#${nodes[Math.floor(Math.random() * (nodes.length-1))].id}`)
                .attr('r', 2)
                .attr('stroke', '#F00')
                .attr('stroke-opacity', 1)
                .attr('stroke-width', '10px')
            .transition()
            .duration(1000)
                .attr('r', 30)
                .attr('fill', 'none')
                .attr('stroke-width', '0.1px')
        }
    }

    function refresh() {
        if (this._.drag==null) {
            $.pings.style('display', 'none');
        } else if (!this._.drag && $.pings && this._.options.showPings) {
            const proj = this._.proj;
            const center = this._.proj.invert(this._.center);
            $.pings
            .attr('cx', d => proj(d.geometry.coordinates)[0])
            .attr('cy', d => proj(d.geometry.coordinates)[1])
            .style('display', function(d) {
                return d3.geoDistance(d.geometry.coordinates, center) > 1.57 ? 'none' : 'inline';
            });
        }
    }

    return {
        name: 'pingsSvg',
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
                _.dataPings = data;
            } else {
                return _.dataPings;
            }
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $pings() {return $.pings;},
    }
}
