// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
export default ({zoomScale,intervalDrag}={zoomScale:[0,50000]}) => {
    /*eslint no-console: 0 */
    const _ = {
        svg:null,
        wait: null,
        zoom: null,
        mouse: null,
        q: null,
        sync: [],
        onDrag: {},
        onDragVals: [],
        onDragStart: {},
        onDragStartVals: [],
        onDragEnd: {},
        onDragEndVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: []
    };
    const scale = d3.scaleLinear().domain([30,300]).range([0.1,1]);

    if (zoomScale===undefined) {
        zoomScale = [0,50000];
    }

    function onclick() {
        _.onClickVals.forEach(v => {
            v.call(_._this, _.event, _.mouse);
        });
    }

    function ondblclick() {
        _.onDblClickVals.forEach(v => {
            v.call(_._this, _.event, _.mouse);
        });
    }

    let v0, // Mouse position in Cartesian coordinates at start of drag gesture.
        r0, // Projection rotation as Euler angles at start.
        q0; // Projection rotation as versor at start.

    function r(__) {
        const versor = __.versor;
        const v1 = versor.cartesian(__.proj.rotate(r0).invert(_.mouse)),
              q1 = versor.multiply(q0, versor.delta(v0, v1));
        _.r = versor.rotation(q1);
    }

    function drag(__) {
        r(__);
        __.rotate(_.r);
        _.onDragVals.forEach(v => {
            v.call(this, _.mouse);
        });
    }

    function init() {
        const __ = this._;
        const versor = __.versor;
        const s0 = __.proj.scale();
        const wh = [__.options.width, __.options.height];
        _.zoom = d3.zoom()
            .on('zoom', zoom)
            .scaleExtent([0.1,160])
            .translateExtent([[0,0], wh]);

        _.svg.call(d3.drag()
            .on('start',dragstarted)
            .on('end',  dragsended)
            .on('drag', dragged));
        _.svg.call(_.zoom);

        // todo: add zoom lifecycle to optimize plugins zoom-able
        // ex: barTooltipSvg, at the end of zoom, need to recreate
        function zoom() {
            const z = zoomScale;
            const r1 = s0 * d3.event.transform.k;
            if (r1>=z[0] && r1<=z[1]) {
                __.scale(r1);
                _.sync.forEach(g=>g._.scale(r1));
            }
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
            _.onDragStartVals.forEach(v => v.call(this, mouse));
            _.onDragVals.forEach(     v => v.call(this, mouse));
            __.refresh();
            _.mouse = mouse;
            _._this = this;
            _.t1 = 0;
            _.t2 = 0;
        }

        function dragged() { // DOM update must be onInterval!
            __.drag = true;
            _._this = this;
            _.mouse = d3.mouse(this);
            !intervalDrag && drag(__);
            // _.t1+=1; // twice call compare to onInterval
        }

        function dragsended() {
            var drag = __.drag;
            __.drag = false;
            if (drag===null) {
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
            } else if (drag) {
                r(__);
                __.rotate(_.r);
                _.onDragVals.forEach(v => v.call(_._this, _.mouse));
                _.sync.forEach(g=>rotate.call(g, _.r));
            }
            _.onDragEndVals.forEach(v => v.call(this, _.mouse));
            __.refresh();
            // console.log('ttl:',_.t1,_.t2);
        }
    }

    function interval() {
        const __ = this._;
        if (__.drag && intervalDrag) {
            if (_.oMouse[0]!==_.mouse[0] &&
                _.oMouse[1]!==_.mouse[1]) {
                _.oMouse = _.mouse;
                drag(__);
                // _.t2+=1;
            }
        } else if (_.wait===false) {
            _.wait = null;
            onclick();
        }
    }

    return {
        name: 'mousePlugin',
        onInit(me) {
            _.me = me;
            _.oMouse = [];
            _.svg = this._.svg;
            init.call(this);
        },
        onInterval() {
            interval.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.call(d3.zoom()
                    .on('zoom start end', null));
                _.svg.call(d3.drag()
                    .on('start',null)
                    .on('end',  null)
                    .on('drag', null));
                _.svg = d3.selectAll(q);
                init.call(this);
                if (this.hoverCanvas) {
                    this.hoverCanvas.selectAll(q);
                }
            }
            return _.svg;
        },
        sync(arr) {
            _.sync = arr;
        },
        zoom(k) {
            if (k) {
                _.zoom.scaleTo(_.svg, scale(k));
            } else {
                return this._.proj.scale();
            }
        },
        mouse() {
            return _.mouse;
        },
        onDrag(obj) {
            Object.assign(_.onDrag, obj);
            _.onDragVals = Object.keys(_.onDrag).map(k => _.onDrag[k]);
        },
        onDragStart(obj) {
            Object.assign(_.onDragStart, obj);
            _.onDragStartVals = Object.keys(_.onDragStart).map(k => _.onDragStart[k]);
        },
        onDragEnd(obj) {
            Object.assign(_.onDragEnd, obj);
            _.onDragEndVals = Object.keys(_.onDragEnd).map(k => _.onDragEnd[k]);
        },
        onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(k => _.onClick[k]);
        },
        onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(k => _.onDblClick[k]);
        }
    }
}
