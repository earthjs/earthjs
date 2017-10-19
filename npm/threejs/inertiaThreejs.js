// https://armsglobe.chromeexperiments.com/
export default function (ref) {
    if ( ref === void 0 ) ref={zoomScale:[0,50000]};
    var zoomScale = ref.zoomScale;

    /*eslint no-console: 0 */
    var _ = {};

    var rotateX = 0,
        rotateY = 0,
        rotateVX = 0,
        rotateVY = 0;

    var dragging = false,
        rendering = false,
        draggMove = undefined;

    var rotateXMax = 90 * Math.PI/180;

    function inertiaDrag() {
        if (!rendering) {
            _.removeEventQueue(_.me.name, 'onTween');
            return;
        }

        rotateX += rotateVX;
        rotateY += rotateVY;

        rotateVX *= 0.98;
        rotateVY *= 0.98;

        if (dragging) {
            rotateVX *= 0.6;
            rotateVY *= 0.6;
        }

        if (rotateX < -rotateXMax) {
            rotateX = -rotateXMax;
            rotateVX *= -0.95;
        }

        if (rotateX > rotateXMax) {
            rotateX = rotateXMax;
            rotateVX *= -0.95;
        }

        if (!dragging &&
            _.rotation.x.toPrecision(5) === rotateX.toPrecision(5) &&
            _.rotation.y.toPrecision(5) === rotateY.toPrecision(5)) {
            rendering = false;
        } else {
            _.rotation.x = rotateX;
            _.rotation.y = rotateY;
            _.renderThree(true);
        }
    }

    function mouseLocation() {
        var r = _.node.getClientRects()[0];
        var t = d3.event.touches ? d3.event.touches[0] : d3.event;
        return [t.clientX - r.width * 0.5, t.clientY - r.height * 0.5];
    }

    var cmouse, pmouse;
    function onStartDrag() {
        dragging = true;
        rendering = true;
        draggMove = null;
        cmouse = mouseLocation();
        _.removeEventQueue(_.me.name, 'onTween');
    }

    function onDragging() {
        if(dragging){
            pmouse = cmouse;
            draggMove = true;
            cmouse = mouseLocation()
            rotateVY += (cmouse[0] - pmouse[0]) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
            rotateVX += (cmouse[1] - pmouse[1]) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
            rotateX = _.rotation.x;
            rotateY = _.rotation.y;
            inertiaDrag.call(_.this);
        }
    }

    function onEndDrag(){
        dragging = false;
        if (draggMove) {
            draggMove = false;
            _.addEventQueue(_.me.name, 'onTween');
        }
    }

    function init() {
        var s0 = this._.proj.scale();
        var ref = this._;
        var proj = ref.proj;
        var options = ref.options;
        var width = options.width;
        var height = options.height;
        var scale = d3.scaleLinear().domain([0,s0]).range([0,1]);
        function zoom() {
            var z = zoomScale;
            var r1 = s0 * d3.event.transform.k;
            if (r1>=z[0] && r1<=z[1]) {
                var s = scale(r1);
                proj.scale(r1);
                _.scale.x = s;
                _.scale.y = s;
                _.scale.z = s;
                _.renderThree(true);
            }
        }

        this._.svg
        .on('mousedown touchstart', onStartDrag)
        .on('mousemove touchmove', onDragging)
        .on('mouseup touchend', onEndDrag);

        this._.svg.call(
            d3.zoom()
            .on('zoom', zoom)
            .scaleExtent([0.1,160])
            .translateExtent([[0,0], [width, height]])
            .filter(function() {
                var ref = d3.event;
                var touches = ref.touches;
                var type = ref.type;
                return (type==='wheel' || touches);
            })
        );

    }

    function create() {
        _.tj = this.threejsPlugin;
        _.node = this._.svg.node();
        _.scale = _.tj.group.scale;
        _.rotation = _.tj.group.rotation;
        _.renderThree = _.tj.renderThree;
        _.addEventQueue = this.__addEventQueue;
        _.removeEventQueue = this.__removeEventQueue;
    }

    return {
        name: 'inertiaThreejs',
        onInit: function onInit(me) {
            _.me = me;
            _.this = this;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onTween: function onTween() { // requestAnimationFrame()
            inertiaDrag.call(this);
        }
    }
}
