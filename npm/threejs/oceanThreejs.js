// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default function () {
    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null,
        material: new THREE.MeshNormalMaterial({
            transparent: false,
            wireframe: false,
            opacity: 0.8,
        })
    }

    function init() {
        var o = this._.options;
        o.showOcean = true;
        o.transparentOcean = false;
    }

    function create() {
        var o = this._.options;
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            _.sphereObject = new THREE.Mesh(geometry, _.material);
        }
        _.material.transparent = (o.transparent || o.transparentOcean);
        _.sphereObject.visible = o.showOcean;
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'oceanThreejs',
        onInit: function onInit() {
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showOcean;
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
