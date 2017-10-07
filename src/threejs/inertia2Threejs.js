// https://armsglobe.chromeexperiments.com/
export default () => {
    /*eslint no-console: 0 */
    /*eslint no-debugger: 0 */
    const _ = {};

    let mouseX = 0,
        mouseY = 0,
        pmouseX = 0,
        pmouseY = 0;

    let rotateX = 0,
        rotateY = 0,
        rotateVX = 0,
        rotateVY = 0;

    let timer = null,
        dragging = false,
        rendering = false;

    const rotateXMax = 90 * Math.PI/180;

    function animate() {
        if (!rendering) {
            timer && timer.stop();
            timer = null;
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
        console.log(rotateX, rotateY);
    }

    function onDocumentMouseDown() {
        dragging = true;
        rendering = true;
        rotateX = _.rotation.x;
        rotateY = _.rotation.y;
        if (!timer) {
            timer = d3.timer(animate);
        }
    }

    function onDocumentMouseMove() {
        pmouseX = mouseX;
        pmouseY = mouseY;

        if (d3.event.touches) {
            const t = d3.event.touches[0];
            mouseX = t.clientX - window.innerWidth * 0.5;
            mouseY = t.clientY - window.innerHeight * 0.5;
        } else {
            mouseX = d3.event.clientX - window.innerWidth * 0.5;
            mouseY = d3.event.clientY - window.innerHeight * 0.5;
        }

        if(dragging){
            rotateVY += (mouseX - pmouseX) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
            rotateVX += (mouseY - pmouseY) / 2 * 0.005235987755982988; // Math.PI / 180 * 0.3;
        }
    }

    function onDocumentMouseUp(){
        dragging = false;
    }

    function init() {
        this._.svg
        .on('mousedown touchstart', onDocumentMouseDown)
        .on('mousemove touchmove', onDocumentMouseMove)
        .on('mouseup touchend', onDocumentMouseUp);
    }

    function create() {
        const tj = this.threejsPlugin;
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
    }
}
