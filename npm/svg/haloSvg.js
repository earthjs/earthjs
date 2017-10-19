export default function (haloColor) {
    if ( haloColor === void 0 ) haloColor='#fff';

    var _ = {svg:null, q: null};
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showHalo = true;
        _.svg = __.svg;
    }

    function create() {
        var klas = _.me.name;
        _.svg.selectAll(("#halo,.halo." + klas)).remove();
        if (this._.options.showHalo) {
            this.$slc.defs.append('radialGradient')
                .attr('id','halo')
                .attr('cx','50%')
                .attr('cy','50%')
                .html(("\n<stop offset=\"85%\" stop-color=\"" + haloColor + "\" stop-opacity=\"1\"></stop>\n<stop offset=\"100%\" stop-color=\"" + haloColor + "\" stop-opacity=\"0\"></stop>\n"));
            $.halo = _.svg
                .append('g').attr('class',("halo " + klas))
                .append('ellipse')
                    .attr('class', 'noclicks')
                    .attr('cx', this._.center[0])
                    .attr('cy', this._.center[1]);
            resize.call(this);
        }
    }

    var scale = d3.scaleLinear().domain([100, 300]).range([110, 330]);
    function resize() {
        var r = scale(this._.proj.scale());
        $.halo.attr('rx', r).attr('ry', r);
    }

    return {
        name: 'haloSvg',
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
        $halo: function $halo() {return $.halo;},
    }
}
