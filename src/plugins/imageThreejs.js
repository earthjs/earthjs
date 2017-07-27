export default (imgUrl='../d/world.png') => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null};

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const _this = this;
            const loader = new THREE.TextureLoader();
            loader.load(imgUrl, function(map) {
                const geometry = new THREE.SphereGeometry(200,30,30);
                const material = new THREE.MeshBasicMaterial({map});
                _.sphereObject = new THREE.Mesh(geometry, material);
                _.sphereObject.visible = _this._.options.showImage;
                tj.addGroup(_.sphereObject);
                tj.rotate();
            });
        } else {
            tj.addGroup(_.sphereObject);
            tj.rotate();
        }
    }

    function refresh() {
        if (_.sphereObject) {
            _.sphereObject.visible = this._.options.showImage;
        }
    }

    return {
        name: 'imageThreejs',
        onInit() {
            this._.options.showImage = true;
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        sphere() {
            return _.sphereObject;
        }
    }
}
