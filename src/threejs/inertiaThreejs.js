// https://armsglobe.chromeexperiments.com/
export default () => {
    /*eslint no-console: 0 */
    const _ = {};

    let mouseX = 0,
        mouseY = 0,
        pmouseX = 0,
        pmouseY = 0;

    let rotateX = 0,
        rotateY = 0,
        rotateVX = 0,
        rotateVY = 0;

    let dragging = false,
        rendering = false;

    const rotateXMax = 90 * Math.PI/180;

    function animate() {
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
        _.renderThree();
    }

    function onDocumentMouseMove() {
        pmouseX = mouseX;
        pmouseY = mouseY;

        mouseX = d3.event.clientX - window.innerWidth * 0.5;
        mouseY = d3.event.clientY - window.innerHeight * 0.5;

        if(dragging){
            rotateVY += (mouseX - pmouseX) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
            rotateVX += (mouseY - pmouseY) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
        }
    }

    function onDocumentMouseDown() {
        dragging = true;
        rendering = true;
        rotateX = _.rotation.x;
        rotateY = _.rotation.y;
        _.addEventQueue(_.me.name, 'onTween');
    }

    function onDocumentMouseUp(){
        dragging = false;
    }

    function init() {
        this._.svg
        .on('mousedown', onDocumentMouseDown)
        .on('mousemove', onDocumentMouseMove)
        .on('mouseup', onDocumentMouseUp);
    }

    function create() {
        const tj = this.threejsPlugin;
        _.rotation = tj.group.rotation;
        _.renderThree = tj.renderThree;
        _.addEventQueue = this.__addEventQueue;
        _.removeEventQueue = this.__removeEventQueue;
    }

    return {
        name: 'inertiaThreejs',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onTween() {   // requestAnimationFrame()
            animate.call(this);
        }
    }
}
