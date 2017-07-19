export default selector => {
    /*eslint no-console: 0 */
    const _ = {svg:null, q: null, sync: []};

    function zoomSetup() {
        const __ = this._;
        _.svg.on('wheel', function() {
            let y = d3.event.deltaY+__.proj.scale();
            y = (y<20 ? 20 : (y>999 ? 1000 : y));
            __.scale(y);
            _.sync.forEach(function(g) {
                g._.scale.call(g, y);
            })
        });
    }

    return {
        name: 'wheelZoomPlugin',
        onInit() {
            _.svg = selector ? d3.selectAll(selector) : this._.svg;
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.on('wheel', null);
                _.svg = d3.selectAll(q);
                zoomSetup.call(this);
            }
            return _.svg;
        },
        sync(arr) {
            _.sync = arr;
        }
    }
}
