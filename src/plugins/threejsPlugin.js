// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
export default (threejs='three-js') => {
    /*eslint no-console: 0 */
    const _ = {renderer: null, scene: null, camera: null, scale: null};

    function init() {
        const
            width = this._.options.width,
            height= this._.options.height;
        _.scene  = new THREE.Scene()
        _.yAxis  = new THREE.Vector3(0,1,0);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10000)
        _.camera.position.z = 500; // (higher than RADIUS + size of the bubble)
        this._.camera = _.camera;

        // Create renderer object.
        // https://stackoverflow.com/questions/29422118/threejs-canvas-background-black
        // https://stackoverflow.com/questions/16177056/changing-three-js-background-to-transparent-or-other-color
        const container = document.getElementById(threejs);
        _.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: container});
        // _.renderer.domElement.id = threejs;
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        this.renderThree = renderThree; // renderer        
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
