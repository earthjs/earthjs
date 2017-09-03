export default (imgUrl='../d/world.png') => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null};

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const SCALE = this._.proj.scale();
            const loader = new THREE.TextureLoader();
            loader.load(imgUrl, function(map) {
                const geometry = new THREE.SphereGeometry(SCALE, 30, 30);
                const material = new THREE.MeshBasicMaterial({map});
                _.sphereObject = new THREE.Mesh(geometry, material);
                tj.addGroup(_.sphereObject);
                tj.rotate();
            });
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'imageThreejs',
        onInit(me) {
            _.me = me;
            this._.options.showImage = true;
        },
        onCreate() {
            create.call(this);
        },
        sphere() {
            return _.sphereObject;
        }
    }
}
