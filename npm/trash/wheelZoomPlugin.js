export default function (selector) {
    /*eslint no-console: 0 */
    var _ = {svg:null, q: null, sync: []};

    function zoomSetup() {
        var __ = this._;
        _.svg.on('wheel', function() {
            var y = d3.event.deltaY+__.proj.scale();
            y = (y<20 ? 20 : (y>999 ? 1000 : y));
            __.scale(y);
            _.sync.forEach(function(g) {
                g._.scale.call(g, y);
            })
        });
    }

    return {
        name: 'wheelZoomPlugin',
        onInit: function onInit(me) {
            _.me = me;
            _.svg = selector ? d3.selectAll(selector) : this._.svg;
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.on('wheel', null);
                _.svg = d3.selectAll(q);
                zoomSetup.call(this);
            }
            return _.svg;
        },
        sync: function sync(arr) {
            _.sync = arr;
        }
    }
}
