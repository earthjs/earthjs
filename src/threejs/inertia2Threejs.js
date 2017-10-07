// https://armsglobe.chromeexperiments.com/
export default () => {
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
        }

        _.rotation.x = rotateX;
        _.rotation.y = rotateY;
        _.renderThree(true);
    }

    function mouseLocation() {
        const rects = _.node.getClientRects()[0];
        if (d3.event.touches) {
            const t = d3.event.touches[0];
            return [
                t.clientX - rects.width * 0.5,
                t.clientY - rects.height * 0.5
            ];
        } else {
            return [
                d3.event.clientX - rects.width * 0.5,
                d3.event.clientY - rects.height * 0.5
            ]
        }
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
            cmouse = mouseLocation()
            rotateVY += (cmouse[0] - pmouse[0]) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
            rotateVX += (cmouse[1] - pmouse[1]) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
            rotateX = _.rotation.x;
            rotateY = _.rotation.y;
            draggMove = true;
            inertiaDrag()
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
        this._.svg
        .on('mousedown touchstart', onStartDrag)
        .on('mousemove touchmove', onDragging)
        .on('mouseup touchend', onEndDrag);
    }

    function create() {
        const tj = this.threejsPlugin;
        _.node = this._.svg.node();
        _.rotation = tj.group.rotation;
        _.renderThree = tj.renderThree;
        _.addEventQueue = this.__addEventQueue;
        _.removeEventQueue = this.__removeEventQueue;
    }

    return {
        name: 'inertia2Threejs',
        onInit(me) {
            _.me = me;
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
