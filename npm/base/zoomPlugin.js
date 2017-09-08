export default function () {
    /*eslint no-console: 0 */
    var _ = {}

    function init() {
        var __ = this._;
        var s0 = __.proj.scale();
        var wh = [__.options.width, __.options.height];

        __.svg.call(d3.zoom()
            .on('zoom start end', zoom)
            .scaleExtent([0.1, 5])
            .translateExtent([[0,0], wh]));

        function zoom() {
            var t = d3.event.transform;
            __.proj.scale(s0 * t.k);
            __.resize();
            __.refresh();
        }
    }

    return {
        name: 'zoomPlugin',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        }
    }
}
