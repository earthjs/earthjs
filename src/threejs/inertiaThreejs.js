// https://armsglobe.chromeexperiments.com/
export default ({zoomScale}={zoomScale:[0,50000]}) => {
    /*eslint no-console: 0 */
    const _ = {};

    let rotateX = 0,
        rotateY = 0,
        rotateVX = 0,
        rotateVY = 0;

    let dragging = false,
        rendering = false,
        draggMove = undefined;

    const rotateXMax = 90 * Math.PI/180;

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
        const r = _.node.getClientRects()[0];
        const t = d3.event.touches ? d3.event.touches[0] : d3.event;
        return [t.clientX - r.width * 0.5, t.clientY - r.height * 0.5];
    }

    let cmouse, pmouse;
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
        const s0 = proj.scale();
        const {proj, options} = this._;
        const {width, height} = options;
        const scale = d3.scaleLinear().domain([0,s0]).range([0,1]);
        function zoom() {
            const z = zoomScale;
            const r1 = s0 * d3.event.transform.k;
            if (r1>=z[0] && r1<=z[1]) {
                const s = scale(r1);
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
                const {touches, type} = d3.event;
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
        onInit(me) {
            _.me = me;
            _.this = this;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onTween() { // requestAnimationFrame()
            inertiaDrag.call(this);
        }
    }
}
