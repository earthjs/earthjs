export default function () {
    var _ = {svg:null, q: null, sphereColor: 0};
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showSphere = true;
        _.svg = __.svg;
    }

    function create() {
        var klas = _.me.name;
        _.svg.selectAll(("#glow,.sphere." + klas)).remove();
        if (this._.options.showSphere) {
            this.$slc.defs.nodes()[0].append("\n<filter id='glow'>\n    <feColorMatrix type='matrix'\n        values=\n        '0 0 0 0   0\n         0 0 0 0.9 0\n         0 0 0 0.9 0\n         0 0 0 1   0'/>\n    <feGaussianBlur stdDeviation='5.5' result='coloredBlur'/>\n    <feMerge>\n        <feMergeNode in='coloredBlur'/>\n        <feMergeNode in='SourceGraphic'/>\n    </feMerge>\n</filter>\n");
            $.sphere = _.svg.append('g').attr('class',("sphere " + klas)).append('circle')
            .attr('cx',this._.center[0]).attr('cy', this._.center[1])
            .attr('class', 'noclicks').attr('filter', 'url(#glow)');
            resize.call(this);
        }
    }

    function resize() {
        $.sphere.attr('r', this._.proj.scale());
    }

    return {
        name: 'sphereSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $sphere: function $sphere() {return $.sphere;},
    }
}
