// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
export default (threejs='three-js') => {
    /*eslint no-console: 0 */
    const _ = {renderer: null, scene: null, camera: null};

    function init() {
        const {width, height} = this._.options;
        const container = document.getElementById(threejs);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10000)
        _.scene  = new THREE.Scene();
        _.camera.position.z = 1010; // (higher than RADIUS + size of the bubble)
        this._.camera = _.camera;

        _.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: container});
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        this.renderThree = renderThree;
    }

    function renderThree() {
        setTimeout(function() {
            _.renderer.render(_.scene, _.camera);
        },1);
    }

    return {
        name: 'threejsPlugin',
        onInit() {
            init.call(this);
        },
        onRefresh() {
            renderThree.call(this);
        },
        addObject(obj) {
            _.scene.add(obj);
        }
    }
}
