export default function () {
    /*eslint no-console: 0 */
    var _ = {svg:null, dataPings: null};
    var $ = {};

    function init() {
        var this$1 = this;

        var __ = this._;
        __.options.showPings = true;
        setInterval(function () { return animate.call(this$1); }, 3000);
        _.svg = __.svg;
    }

    function create() {
        _.svg.selectAll('.pings').remove();
        if (_.dataPings && this._.options.showPings) {
            var g = _.svg.append('g').attr('class','pings');
            $.ping2 = g.selectAll('.ping-2')
                .data(_.dataPings.features).enter().append('circle')
                .attr('class', 'ping-2')
                .attr('id', function (d,i) { return ("ping-" + i); });

            $.pings = g.selectAll('.ping-2');
            refresh.call(this);
            animate.call(this);
        }
    }

    function animate() {
        var nodes = $.ping2.nodes().filter(function (d) { return d.style.display=='inline'; });
        if (nodes.length>0) {
            d3.select(("#" + (nodes[Math.floor(Math.random() * (nodes.length-1))].id)))
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
            var proj = this._.proj;
            var center = this._.proj.invert(this._.center);
            $.pings
            .attr('cx', function (d) { return proj(d.geometry.coordinates)[0]; })
            .attr('cy', function (d) { return proj(d.geometry.coordinates)[1]; })
            .style('display', function(d) {
                return d3.geoDistance(d.geometry.coordinates, center) > 1.57 ? 'none' : 'inline';
            });
        }
    }

    return {
        name: 'pingsSvg',
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
                _.dataPings = data$1;
            } else {
                return _.dataPings;
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $pings: function $pings() {return $.pings;},
    }
}
