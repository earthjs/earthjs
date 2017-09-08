export default function (urlBars) {
    /*eslint no-console: 0 */
    var _ = {svg:null, barProjection: null, q: null, bars: null, valuePath: null};
    var $ = {};
    var scale50 = d3.scaleLinear().domain([0, 200]).range([5, 50]);

    function init() {
        var __ = this._;
        __.options.showBars = true;
        _.barProjection = __.orthoGraphic();
        _.svg = __.svg;
    }

    function create() {
        var __ = this._;
        svgClipPath.call(this);
        _.svg.selectAll('.bar').remove();
        if (_.bars && __.options.showBars) {
            var gBar = _.svg.append('g').attr('class','bar');
            var mask = gBar.append('mask')
                .attr('id', 'edge');
            mask.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('fill', 'white');
            mask.append('use')
                .attr('xlink:href', '#edgeCircle')
                .attr('fill', 'black');

            _.max = d3.max(_.bars.features, function (d) { return parseInt(d.geometry.value); })

            var r = __.proj.scale();
            _.heightScale = d3.scaleLinear().domain([0, _.max]).range([r, r+scale50(r)]);

            $.bar = gBar.selectAll('line').data(_.bars.features).enter().append('line')
                .attr('stroke', 'red')
                .attr('stroke-width', '2')
                .attr('data-index', function (d, i) { return i; });
            refresh.call(this);
        }
    }

    function refresh() {
        var __ = this._;
        if (_.bars && __.options.showBars) {
            var proj1 = __.proj;
            var scale = _.heightScale;
            var proj2 = _.barProjection;
            var center = proj1.invert(__.center);
            proj2.rotate(this._.proj.rotate());
            $.bar
                .each(function(d) {
                    var arr = d.geometry.coordinates;
                    proj2.scale(scale(d.geometry.value));
                    var distance = d3.geoDistance(arr, center);
                    var d1 = proj1(arr);
                    var d2 = proj2(arr);
                    d3.select(this)
                        .attr('x1', d1[0])
                        .attr('y1', d1[1])
                        .attr('x2', d2[0])
                        .attr('y2', d2[1])
                        .attr('mask', distance < 1.57 ? null : 'url(#edge)');
                });
        }
    }

    function svgClipPath() {
        var __ = this._;
        this.$slc.defs.selectAll('clipPath').remove();
        this.$slc.defs.append('clipPath').append('circle')
            .attr('id', 'edgeCircle')
            .attr('cx', __.center[0])
            .attr('cy', __.center[1])
            .attr('r',  __.proj.scale());
    }

    return {
        name: 'barSvg',
        urls: urlBars && [urlBars],
        onReady: function onReady(err, bars) {
            _.me.data(bars);
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
        onResize: function onResize() {
            create.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        valuePath: function valuePath(path) {
            _.valuePath = path;
        },
        data: function data(data$1) {
            var this$1 = this;

            if (data$1) {
                if (_.valuePath) {
                    var p = _.valuePath.split('.');
                    data$1.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) { return v = v[o]; });
                        d.geometry.value = v;
                    });
                }
                _.bars = data$1;
                setTimeout(function () { return refresh.call(this$1); },1);
            } else {
                return _.bars;
            }
        },
        $bar: function $bar() {return $.bar;},
    }
}
