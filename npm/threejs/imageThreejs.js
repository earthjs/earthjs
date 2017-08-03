export default function (imgUrl) {
    if ( imgUrl === void 0 ) imgUrl='../d/world.png';

    /*eslint no-console: 0 */
    var _ = {sphereObject: null};

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var _this = this;
            var SCALE = this._.proj.scale();
            var loader = new THREE.TextureLoader();
            loader.load(imgUrl, function(map) {
                var geometry = new THREE.SphereGeometry(SCALE, 30, 30);
                var material = new THREE.MeshBasicMaterial({map: map});
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
        onInit: function onInit() {
            this._.options.showImage = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    }
}
