export default (worldUrl='../d/world.png') => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null};

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const mesh = topojson.mesh(_.world, _.world.objects.countries);
            const material = new THREE.MeshBasicMaterial({
                // side: THREE.DoubleSide,
                color: 0x707070, //0xefedea,
                // overdraw: 0.25,
            });
            // material
            // var material = new THREE.MeshPhongMaterial( {
            //     color: 0xff0000,
            //     shading: THREE.FlatShading,
            //     polygonOffset: true,
            //     polygonOffsetFactor: 1, // positive value pushes polygon further away
            //     polygonOffsetUnits: 1
            // });
            _.sphereObject = tj.wireframe(mesh, material);
            _.sphereObject.visible = this._.options.showLand;
        }
        // if (this.world3d) {
        //     const s = _.sphereObject.scale;
        //     s.x = 1.03;
        //     s.y = 1.03;
        //     s.z = 1.03;
        // }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'worldThreejs',
        urls: worldUrl && [worldUrl],
        onReady(err, data) {
            this.worldThreejs.data(data);
        },
        onInit() {
            this._.options.showLand = true;
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showLand;
        },
        data(data) {
            if (data) {
                _.world = data;
            } else {
                return  _.world;
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
