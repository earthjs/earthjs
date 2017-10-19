// https://armsglobe.chromeexperiments.com/
export default function (ref) {
    if ( ref === void 0 ) ref={zoomScale:[0,50000]};
    var zoomScale = ref.zoomScale;

    /*eslint no-console: 0 */
    var _ = {
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
        onDblClickVals: [],
        stalledDrag: 0,
    };

    var rotateX = 0,
        rotateY = 0,
        rotateZ = [],
        rotateVX = 0,
        rotateVY = 0,
        previousX = 0,
        previousY = 0;

    var dragging = false,
        rendering = false,
        draggMove = undefined;

    function onclick() {
        _.onClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
    }

    function ondblclick() {
        _.onDblClickVals.forEach(function (v) {
            v.call(_._this, _.event, _.mouse);
        });
    }

    function stopDrag() {
        var this$1 = this;

        _.this._.drag = false;
        _.this._.refresh();
        _.onDragEndVals.forEach(function (v) { return v.call(this$1, _.event, _.mouse); });
    }

    function inertiaDrag() {
        var this$1 = this;

        _.onDragVals.forEach(function (v) { return v.call(this$1, _.event, _.mouse); });
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

        var r = [rotateX, rotateY, rotateZ[2]];
        var l = _.sync.length;
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
        var ref = _.event;
        var sourceEvent = ref.sourceEvent;
        if (sourceEvent) { // sometime sourceEvent=null
            var t = sourceEvent.touches ? sourceEvent.touches[0] : sourceEvent;
            return [t.clientX, -t.clientY];
        }
    }

    var cmouse, pmouse;
    function onStartDrag() {
        var this$1 = this;

        rotateVX = 0;
        rotateVY = 0;
        dragging = true;
        rendering = true;
        draggMove = null;
        cmouse = mouseMovement.call(this);
        _.onDragStartVals.forEach(function (v) { return v.call(this$1, _.event, _.mouse); });
        _.onDragVals.forEach(     function (v) { return v.call(this$1, _.event, _.mouse); });
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
            _.stalledDrag = 0;
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
        var __ = this._;
        var s0 = __.proj.scale();
        function zoomAndDrag() {
            var ref = d3.event.sourceEvent;
            var type = ref.type;
            var touches = ref.touches;
            if (type==='wheel' || (touches && touches.length===2)) {
                var r1 = s0 * d3.event.transform.k;
                if (r1>=zoomScale[0] && r1<=zoomScale[1]) {
                    var l = _.sync.length;
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

        var ref = __.options;
        var width = ref.width;
        var height = ref.height;
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
        onInit: function onInit(me) {
            _.me = me;
            _.this = this;
            _.svg = this._.svg;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        selectAll: function selectAll(q) {
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
        onInterval: function onInterval() {
            if (draggMove && _.stalledDrag++ > 10) { // reset inertia
                _.stalledDrag = 0;
                rotateVX = 0;
                rotateVY = 0;
            }
        },
        onTween: function onTween() { // requestAnimationFrame()
            inertiaDrag.call(this);
        },
        sync: function sync(arr) {
            _.sync = arr;
        },
        onDrag: function onDrag(obj) {
            Object.assign(_.onDrag, obj);
            _.onDragVals = Object.keys(_.onDrag).map(function (k) { return _.onDrag[k]; });
        },
        onDragStart: function onDragStart(obj) {
            Object.assign(_.onDragStart, obj);
            _.onDragStartVals = Object.keys(_.onDragStart).map(function (k) { return _.onDragStart[k]; });
        },
        onDragEnd: function onDragEnd(obj) {
            Object.assign(_.onDragEnd, obj);
            _.onDragEndVals = Object.keys(_.onDragEnd).map(function (k) { return _.onDragEnd[k]; });
        },
        stopDrag: function stopDrag() {
            rendering = false;
        },
        onClick: function onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(function (k) { return _.onClick[k]; });
        },
        onDblClick: function onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(function (k) { return _.onDblClick[k]; });
        }
    }
}
