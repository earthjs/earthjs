// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
export default function () {
    /*eslint no-console: 0 */
    var _ = {svg:null, q: null};
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showDropShadow = true;
        _.svg = __.svg;
    }

    function create() {
        var __ = this._;
        _.svg.selectAll('#drop_shadow,.drop_shadow').remove();
        if (__.options.showDropShadow) {
            var drop_shadow = this.$slc.defs.append('radialGradient')
            .attr('id', 'drop_shadow')
            .attr('cx', '50%')
            .attr('cy', '50%');
            drop_shadow.append('stop')
            .attr('offset','20%').attr('stop-color', '#000')
            .attr('stop-opacity','.5')
            drop_shadow.append('stop')
            .attr('offset','100%').attr('stop-color', '#000')
            .attr('stop-opacity','0')
            $.dropShadow = _.svg.append('g').attr('class','drop_shadow').append('ellipse')
            .attr('cx', __.center[0])
            .attr('class', 'noclicks')
            .style('fill', 'url(#drop_shadow)');
            resize.call(this);
        }
    }

    function resize() {
        var scale = this._.proj.scale();
        $.dropShadow
        .attr('cy', scale+this._.center[1])
        .attr('rx', scale*0.90)
        .attr('ry', scale*0.25);
    }

    return {
        name: 'dropShadowSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            if ($.dropShadow && this._.options.showDropShadow) {
                resize.call(this);
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $dropShadow: function $dropShadow() {return $.dropShadow;},
    }
}
