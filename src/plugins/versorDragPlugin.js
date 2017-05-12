// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
import versorFn from '../versor.js';

var versor = versorFn();
export default function() {
    var _ = {svg:null, q: null, sync: []};

    function dragSetup() {
        var _this = this;
        _.svg.call(d3.drag()
            .on('start', dragstarted)
            .on('end',   dragsended)
            .on('drag',  dragged));

        var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
            r0, // Projection rotation as Euler angles at start.
            q0; // Projection rotation as versor at start.

        function rotate(src) {
            var r = src._.proj.rotate();
            var d = r[0] - r0[0];
            r[0] = d + this._.proj.rotate()[0];
            if (r[0] >= 180)
                r[0] -= 360;
            this._.rotate(r);
        }

        function dragstarted() {
            _this._.drag = true;
            v0 = versor.cartesian(_this._.proj.invert(d3.mouse(this)));
            r0 = _this._.proj.rotate();
            q0 = versor(r0);
        }

        function dragsended() {
            _.sync.forEach(function(p) {
                rotate.call(p, _this);
            })
            _this._.drag = false;
        }

        function dragged() {
            var v1 = versor.cartesian(_this._.proj.rotate(r0).invert(d3.mouse(this))),
                q1 = versor.multiply(q0, versor.delta(v0, v1)),
                r1 = versor.rotation(q1);
            _this._.rotate(r1);
        }
    }

    return {
        name: 'versorDragPlugin',
        onInit() {
            _.svg = this._.svg;
            dragSetup.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
                dragSetup.call(this);
            }
            return _.svg;
        },
        sync(arr) {
            _.sync = arr;
        }
    }
}
