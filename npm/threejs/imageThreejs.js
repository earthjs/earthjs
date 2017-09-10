export default function (imgUrl) {
    if ( imgUrl === void 0 ) imgUrl='../d/world.png';

    /*eslint no-console: 0 */
    var _ = {sphereObject: null};

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var loader = new THREE.TextureLoader();
            loader.load(imgUrl, function(map) {
                var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
                var material = new THREE.MeshBasicMaterial({map: map});
                _.sphereObject = new THREE.Mesh(geometry, material);
                tj.addGroup(_.sphereObject);
            });
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'imageThreejs',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showImage = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    }
}
