export default (
    imgUrl='../d/world.jpg',
    elvUrl='../d/elevation.jpg',
    wtrUrl='../d/water.png') => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null};
    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);

    function init() {
        this._.options.showGlobe = true;
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const SCALE = this._.proj.scale();
            const earth_img = loader.load(imgUrl, image=>image);
            const elevt_img = loader.load(elvUrl, image=>image);
            const water_img = loader.load(wtrUrl, image=>image);
            const geometry  = new THREE.SphereGeometry(SCALE, 30, 30);
            const material  = new THREE.MeshPhongMaterial({
                map: earth_img,
                bumpMap: elevt_img,
                bumpScale: 0.01,
                specularMap: water_img,
                specular: new THREE.Color('grey')
            })
            _.sphereObject = new THREE.Mesh(geometry, material);

            var ambient= new THREE.AmbientLight(0x777777);
            var light1 = new THREE.DirectionalLight(0xffffff, 0.2);
            var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
            light1.position.set(5, 3,  6);
            light2.position.set(5, 3, -6);
            tj.addGroup(ambient);
            tj.addGroup(light1);
            tj.addGroup(light2);
            tj.addGroup(_.sphereObject);
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'globeThreejs',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        sphere() {
            return _.sphereObject;
        }
    }
}
