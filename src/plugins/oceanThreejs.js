// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default () => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null};

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const geometry = new THREE.SphereGeometry(200,30,30);
            const material = new THREE.MeshNormalMaterial({
                transparent: true,
                wireframe: false,
                opacity: 0.8,
            });
            // var material = new THREE.MeshPhongMaterial( {
            //     shading: THREE.SmoothShading, //FlatShading,
            //     transparent: true,
            //     wireframe: false,
            //     color: 0x3794cf, //0xff0000,
            //     shininess: 40,
            //     opacity: 0.8,
            //     // polygonOffset: true,
            //     // polygonOffsetFactor: 1, // positive value pushes polygon further away
            //     // polygonOffsetUnits: 1
            // });

            _.sphereObject = new THREE.Mesh(geometry, material);
            _.sphereObject.visible = this._.options.showOcean;
        }
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'oceanThreejs',
        onInit() {
            this._.options.showOcean = true;
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showOcean;
        },
    }
}
