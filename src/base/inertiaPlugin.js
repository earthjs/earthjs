// https://armsglobe.chromeexperiments.com/
export default ({zoomScale}={zoomScale:[0,50000]}) => {
    /*eslint no-console: 0 */
    const _ = {
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

    let rotateX = 0,
        rotateY = 0,
        rotateZ = [],
        rotateVX = 0,
        rotateVY = 0,
        previousX = 0,
        previousY = 0;

    let dragging = false,
        rendering = false,
        draggMove = undefined;

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

    function stopDrag() {
        _.this._.drag = false;
        _.this._.refresh();
        _.onDragEndVals.forEach(v => v.call(this, _.event, _.mouse));
    }

    function inertiaDrag() {
        _.onDragVals.forEach(v => v.call(this, _.event, _.mouse));
        if (!rendering) {
            _.removeEventQueue(_.me.name, 'onTween');
            stopDrag();
            return;
        }

        rotateVX *= 0.99;
        rotateVY *= 0.90;

        if (dragging) {
            rotateVX *= 0.25;
            rotateVY *= 0.20;
        }

        if (rotateY < -100) {
            rotateY = -100;
            rotateVY *= -0.95;
        }

        if (rotateY > 100) {
            rotateY = 100;
            rotateVY *= -0.95;
        }

        rotateX += rotateVX;
        rotateY += rotateVY;

        const r = [rotateX, rotateY, rotateZ[2]];
        let l = _.sync.length;
        _.rotate(r);
        while(l--) {
            _.sync[l]._.rotate(r)
        }

        if (!dragging &&
            previousX.toPrecision(5) === rotateX.toPrecision(5) &&
            previousY.toPrecision(5) === rotateY.toPrecision(5)) {
            rendering = false;
        }
        previousX = rotateX;
        previousY = rotateY;
    }

    function mouseMovement() {
        _.event = d3.event;
        _.mouse = d3.mouse(this);
        const {sourceEvent} = _.event;
        if (sourceEvent) { // sometime sourceEvent=null
            const t = sourceEvent.touches ? sourceEvent.touches[0] : sourceEvent;
            return [t.clientX, -t.clientY];
        }
    }

    let cmouse, pmouse;
    function onStartDrag() {
        rotateVX = 0;
        rotateVY = 0;
        dragging = true;
        rendering = true;
        draggMove = null;
        cmouse = mouseMovement.call(this);
        _.onDragStartVals.forEach(v => v.call(this, _.event, _.mouse));
        _.onDragVals.forEach(     v => v.call(this, _.event, _.mouse));
        _.removeEventQueue(_.me.name, 'onTween');
        _.this._.drag = null;
    }

    function onDragging() {
        if(dragging){
            draggMove = true;
            pmouse = cmouse;
            cmouse = mouseMovement.call(this);
            if (cmouse) { // sometime sourceEvent=null
                rotateZ = _.proj.rotate();
                rotateX = rotateZ[0];
                rotateY = rotateZ[1];
                rotateVX += cmouse[0] - pmouse[0];
                rotateVY += cmouse[1] - pmouse[1];
                inertiaDrag.call(_.this);
            } else {
                cmouse = pmouse;
            }
            _.this._.drag = true;
            _._this = this;
        }
    }

    function onEndDrag(){
        dragging = false;
        if (draggMove) {
            draggMove = false;
            _.addEventQueue(_.me.name, 'onTween');
        } else {
            stopDrag();
            _.event = d3.event;
            if (draggMove===null) {
                if (_.wait) {
                    clearTimeout(_.wait);
                    _.wait = null;
                    ondblclick();
                } else {
                    _.wait = setTimeout(function() {
                        _.wait = false;
                        onclick();
                    }, 250);
                }
            }
        }
    }

    function init() {
        const __ = this._;
        const s0 = __.proj.scale();
        function zoomAndDrag() {
            const {type, touches} = d3.event.sourceEvent;
            if (type==='wheel' || (touches && touches.length===2)) {
                const r1 = s0 * d3.event.transform.k;
                if (r1>=zoomScale[0] && r1<=zoomScale[1]) {
                    let l = _.sync.length;
                    __.scale(r1);
                    while(l--) {
                        _.sync[l]._.scale(r1)
                    }
                }
                rotateVX = 0;
                rotateVY = 0;
            } else {
                onDragging.call(this);
            }
        }

        const {width, height} = __.options;
        _.svg.call(
            d3.zoom()
            .on("start", onStartDrag)
            .on('zoom', zoomAndDrag)
            .on("end", onEndDrag)
            .scaleExtent([0.1,160])
            .translateExtent([[0,0], [width, height]])
        );

    }

    function create() {
        _.proj = this._.proj;
        _.rotate = this._.rotate;
        _.addEventQueue = this.__addEventQueue;
        _.removeEventQueue = this.__removeEventQueue;
    }

    return {
        name: 'inertiaPlugin',
        onInit(me) {
            _.me = me;
            _.this = this;
            _.svg = this._.svg;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.call(d3.zoom()
                .on('start',null)
                .on('zoom', null)
                .on('end',  null));
                _.svg = d3.selectAll(q);
                init.call(this);
                if (this.hoverCanvas) {
                    this.hoverCanvas.selectAll(q);
                }
            }
            return _.svg;
        },
        onTween() { // requestAnimationFrame()
            inertiaDrag.call(this);
        },
        sync(arr) {
            _.sync = arr;
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
        stopDrag() {
            rendering = false;
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
