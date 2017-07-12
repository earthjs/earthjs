// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
export default function() {
    /*eslint no-console: 0 */
    const _ = {svg:null, q: null, sync: [], mouse: null, wait: null,
        onDrag: {},
        onDragKeys: [],
        onClick: {},
        onClickKeys: [],
        onDblClick: {},
        onDblClickKeys: []
    };

    function onclick() {
        _.onClickKeys.forEach(k => {
            _.onClick[k].call(_._this, _.event, _.mouse);
        });
        // console.log('click');
    }

    function ondblclick() {
        _.onDblClickKeys.forEach(k => {
            _.onDblClick[k].call(_._this, _.event, _.mouse);
        });
        // console.log('dblclick');
    }

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
            const mouse = d3.mouse(this);
            v0 = versor.cartesian(__.proj.invert(d3.mouse(this)));
            r0 = __.proj.rotate();
            q0 = versor(r0);
            __.drag = null;
            __.refresh();
            _.mouse = mouse;
            _._this = this;
        }

        function dragged() {
            // DOM update must be onInterval!
            const mouse = d3.mouse(this);
            const v1 = versor.cartesian(__.proj.rotate(r0).invert(mouse)),
                  q1 = versor.multiply(q0, versor.delta(v0, v1));
            _.r = versor.rotation(q1);
            _.mouse = mouse;
            _._this = this;
            __.drag = true;
        }

        function dragsended() {
            if (__.drag===null) {
                _.event = d3.event;
                if (__.options.spin) {
                    // console.log('lol');
                    onclick();
                } else if (_.wait) {
                    _.wait = null;
                    ondblclick();
                } else if (_.wait===null) {
                    _.wait = window.setTimeout(function() {
                        if (_.wait) {
                            _.wait = false;
                        }
                    }, 250);
                }
            } else {
                __.drag = false;
                __.rotate( _.r);
                _.onDragKeys.forEach(k => {
                    _.onDrag[k].call(_._this, _.mouse);
                });
                _.sync.forEach(function(g) {
                    rotate.call(g, _.r);
                })
            }
            // _.mouse = null;
            // _.r = null;
        }
    }

    return {
        name: 'mousePlugin',
        onInit() {
            _.svg = this._.svg;
            dragSetup.call(this);
        },
        onInterval() {
            const __ = this._;
            if (__.drag) {
                if (_.r) {
                    __.rotate( _.r);
                    _.onDragKeys.forEach(k => {
                        _.onDrag[k].call(this, _.mouse);
                    });
                }
            } else if (_.wait===false) {
                _.wait = null;
                onclick();
            }
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
        },
        onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickKeys = Object.keys(_.onClick);
        },
        onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickKeys = Object.keys(_.onDblClick);
        }
    }
}
