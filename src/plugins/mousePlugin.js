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
    }

    function ondblclick() {
        _.onDblClickKeys.forEach(k => {
            _.onDblClick[k].call(_._this, _.event, _.mouse);
        });
    }

    let v0, // Mouse position in Cartesian coordinates at start of drag gesture.
        r0, // Projection rotation as Euler angles at start.
        q0; // Projection rotation as versor at start.

    function r() {
        const __ = this._;
        const versor = __.versor;
        const v1 = versor.cartesian(__.proj.rotate(r0).invert(_.mouse)),
              q1 = versor.multiply(q0, versor.delta(v0, v1));
        _.r = versor.rotation(q1);
    }

    function init() {
        const __ = this._;
        const versor = __.versor;
        const s0 = __.proj.scale();
        const wh = [__.options.width, __.options.height];

        _.svg.call(d3.drag()
            .on('start',dragstarted)
            .on('end',  dragsended)
            .on('drag', dragged));

        _.svg.call(d3.zoom()
            .on("zoom", zoom)
            .scaleExtent([0.1, 5])
            .translateExtent([[0,0], wh]));

        function zoom() {
            const r1 = s0 * d3.event.transform.k;
            __.scale(r1);
            _.sync.forEach(g=>g._.scale(r1));
        }

        function rotate(r) {
            const d = r[0] - r0[0];
            r[0] = d + this._.proj.rotate()[0];
            if (r[0] >= 180)
                r[0] -= 360;
            this._.rotate(r);
        }

        function dragstarted() {
            const mouse = d3.mouse(this);
            v0 = versor.cartesian(__.proj.invert(mouse));
            r0 = __.proj.rotate();
            q0 = versor(r0);
            __.drag = null;
            __.refresh();
            _.mouse = mouse;
            _._this = this;
            _.t1 = 0;
            _.t2 = 0;
        }

        function dragged() { // DOM update must be onInterval!
            _.mouse = d3.mouse(this);
            _._this = this;
            __.drag = true;
            // _.t1+=1; // twice call compare to onInterval
        }

        function dragsended() {
            if (__.drag===null) {
                _.event = d3.event;
                if (__.options.spin) {
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
            } else if (__.drag) {
                __.rotate( _.r);
                _.onDragKeys.forEach(k => {
                    _.onDrag[k].call(_._this, _.mouse);
                });
                _.sync.forEach(g=>rotate.call(g, _.r));
            }
            __.drag = false;
            __.refresh();
            // console.log('ttl:',_.t1,_.t2);
        }
    }

    return {
        name: 'mousePlugin',
        onInit() {
            _.svg = this._.svg;
            _.oMouse = [];
            init.call(this);
        },
        onInterval() {
            const __ = this._;
            if (__.drag) {
                if (_.oMouse[0]!==_.mouse[0] &&
                    _.oMouse[1]!==_.mouse[1]) {
                    _.oMouse = _.mouse;
                    r.call(this);
                    __.rotate(_.r);
                    _.onDragKeys.forEach(k => {
                        _.onDrag[k].call(this, _.mouse);
                    });
                    // _.t2+=1;
                }
            } else if (_.wait===false) {
                _.wait = null;
                onclick();
            }
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.call(d3.zoom()
                    .on("zoom start end", null));
                _.svg.call(d3.drag()
                    .on('start',null)
                    .on('end',  null)
                    .on('drag', null));
                _.svg = d3.selectAll(q);
                init.call(this);
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
