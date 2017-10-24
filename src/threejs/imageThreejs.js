// https://threejs.org/docs/#api/materials/Material
export default (imgUrl='../globe/world.png') => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null};

    function init() {
        const tj = this.threejsPlugin;
        _.material = new THREE.MeshBasicMaterial({
            map: tj.texture(imgUrl),
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.5
        });
        Object.defineProperty(_.me, 'transparent', {
            get: () => _.transparent,
            set: (x) => {
                _.transparent = x;
                if (x) {
                    _.material.side = THREE.DoubleSide;
                    _.material.alphaTest = 0.01;
                } else {
                    _.material.side = THREE.FrontSide;
                    _.material.alphaTest = 0;
                }
                _.material.needsUpdate = true;
            }
        });
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const SCALE = this._.proj.scale();
            const geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            _.sphereObject = new THREE.Mesh(geometry, _.material);
            // _.sphereObject.scale.set(1.02,1.02,1.02);
            _.sphereObject.name = _.me.name;
            tj.addGroup(_.sphereObject);
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'imageThreejs',
        onInit(me) {
            _.me = me;
            _.transparent = false;
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
