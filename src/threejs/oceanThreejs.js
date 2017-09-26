// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default (color, color2=0xAAAAAA) => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null}
    if (color) {
        _.material = new THREE.MeshPhongMaterial({
            color: color
        });
    } else {
        _.material = new THREE.MeshNormalMaterial({
            transparent: false,
            wireframe: false,
            opacity: 0.8,
        });
    }

    function init() {
        this._.options.transparentOcean = false;
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const SCALE = this._.proj.scale();
            const geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            if (color) {
                const ambient= new THREE.AmbientLight(color2);
                const mesh   = new THREE.Mesh(geometry, _.material);
                _.sphereObject = new THREE.Group();
                _.sphereObject.add( ambient );
                _.sphereObject.add(mesh);
            } else {
                _.sphereObject = new THREE.Mesh(geometry, _.material);
            }
            _.sphereObject.name = _.me.name;
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'oceanThreejs',
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
