export default () => {
    function init() {
        const __ = this._;
        const s0 = __.proj.scale();
        const wh = [__.options.width, __.options.height];
        const zoom = d3.zoom().on("zoom start end", zoomed)
            .scaleExtent([0.1, 5]).translateExtent([[0,0], wh]);

        __.svg.call(zoom);

        function zoomed() {
            var t = d3.event.transform;
            __.proj.scale(s0 * t.k);
            __.resize();
            __.refresh();
        }
    }

    return {
        name: 'zoomPlugin',
        onInit() {init.call(this);}
    }
}
