// https://threejs.org/docs/#api/materials/Material
export default function (imgUrl) {
    if ( imgUrl === void 0 ) imgUrl='../globe/world.png';

    /*eslint no-console: 0 */
    var _ = {sphereObject: null};

    function init() {
        var tj = this.threejsPlugin;
        _.material = new THREE.MeshBasicMaterial({
            map: tj.texture(imgUrl),
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.5
        });
        Object.defineProperty(_.me, 'transparent', {
            get: function () { return _.transparent; },
            set: function (x) {
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
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            _.sphereObject = new THREE.Mesh(geometry, _.material);
            _.sphereObject.name = _.me.name;
            tj.addGroup(_.sphereObject);
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'imageThreejs',
        onInit: function onInit(me) {
            _.me = me;
            _.transparent = false;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    }
}
