// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
export default function() {
    /*eslint no-console: 0 */
    const _ = {svg:null, q: null, sync: [], mouse: null, onDrag: {}, onDragKeys: []};

    function dragSetup() {
        const __ = this._;
        const versor = __.versor;
        _.svg.call(d3.drag()
            .on('start',dragstarted)
            .on('end',  dragsended)
            .on('drag', dragged));

        let v0, // Mouse position in Cartesian coordinates at start of drag gesture.
            r0, // Projection rotation as Euler angles at start.
            q0; // Projection rotation as versor at start.

        function rotate(r) {
            const d = r[0] - r0[0];
            r[0] = d + this._.proj.rotate()[0];
            if (r[0] >= 180)
                r[0] -= 360;
            this._.rotate(r);
        }

        function dragstarted() {
            v0 = versor.cartesian(__.proj.invert(d3.mouse(this)));
            r0 = __.proj.rotate();
            q0 = versor(r0);
            __.drag = null;
            __.refresh();
            _.mouse = null;
        }

        function dragged() {
            const mouse = d3.mouse(this);
            const v1 = versor.cartesian(__.proj.rotate(r0).invert(mouse)),
                  q1 = versor.multiply(q0, versor.delta(v0, v1));
            __.rotate( versor.rotation(q1) );
            __.drag = true;
            _.mouse = mouse;
            _.onDragKeys.forEach(k => {
                _.onDrag[k].call(this, mouse);
            });
        }

        function dragsended() {
            const r = __.proj.rotate();
            _.sync.forEach(function(g) {
                rotate.call(g, r);
            })
            __.drag = false;
            __.refresh();
            _.mouse = null;
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
                _.svg.call(d3.drag()
                    .on('start',null)
                    .on('end',  null)
                    .on('drag', null));
                _.svg = d3.selectAll(q);
                dragSetup.call(this);
            }
            return _.svg;
        },
        sync(arr) {
            _.sync = arr;
        },
        mouse() {
            return _.mouse;
        },
        onDrag(obj) {
            Object.assign(_.onDrag, obj);
            _.onDragKeys = Object.keys(_.onDrag);
        }
    }
}
