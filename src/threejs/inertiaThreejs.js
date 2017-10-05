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

    let rotateTargetX = undefined,
        rotateTargetY = undefined;

    const rotateXMax = 90 * Math.PI/180;

    function animate() {
        if (!rendering)
            return;

        if (rotateTargetX !== undefined && rotateTargetY !== undefined) {

            rotateVX += (rotateTargetX - rotateX) * 0.012;
            rotateVY += (rotateTargetY - rotateY) * 0.012;

            if (Math.abs(rotateTargetX - rotateX) < 0.1 && Math.abs(rotateTargetY - rotateY) < 0.1) {
                rotateTargetX = undefined;
                rotateTargetY = undefined;
            }
        }

        rotateX += rotateVX;
        rotateY += rotateVY;

        rotateVX *= 0.98;
        rotateVY *= 0.98;

        if (dragging || rotateTargetX !== undefined) {
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

    function onDocumentMouseMove( event ) {

        pmouseX = mouseX;
        pmouseY = mouseY;

        mouseX = event.clientX - window.innerWidth * 0.5;
        mouseY = event.clientY - window.innerHeight * 0.5;

        if(dragging){
            rotateVY += (mouseX - pmouseX) / 2 * Math.PI / 180 * 0.3;
            rotateVX += (mouseY - pmouseY) / 2 * Math.PI / 180 * 0.3;
        }
    }

    function onDocumentMouseDown() {
        dragging = true;
        rendering = true;
        rotateTargetX = undefined;
        rotateTargetX = undefined;
    }

    function onDocumentMouseUp(){
        dragging = false;
    }

    function init() {
        document.addEventListener( 'mousemove', onDocumentMouseMove, true );
        document.addEventListener( 'mousedown', onDocumentMouseDown, true );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    }

    function create() {
        const tj = this.threejsPlugin;
        _.rotation = tj.group.rotation;
        _.renderThree = tj.renderThree;
        this._.options.tween = animate;  // requestAnimationFrame()
    }

    return {
        name: 'inertiaThreejs',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
            setTimeout(() => {
                rotateX = _.rotation.x;
                rotateY = _.rotation.y;
            }, 0);
        },
    }
}
