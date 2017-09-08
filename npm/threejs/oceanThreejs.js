// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default function (color, color2) {
    if ( color2 === void 0 ) color2=0xAAAAAA;

    /*eslint no-console: 0 */
    var _ = {sphereObject: null}
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
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            if (color) {
                var ambient= new THREE.AmbientLight(color2);
                var mesh   = new THREE.Mesh(geometry, _.material);
                _.sphereObject = new THREE.Group();
                _.sphereObject.add( ambient );
                _.sphereObject.add(mesh);
            } else {
                _.sphereObject = new THREE.Mesh(geometry, _.material);
            }
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'oceanThreejs',
        onInit: function onInit(me) {
            _.me = me;
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
