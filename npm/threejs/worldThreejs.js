export default function (worldUrl) {
    if ( worldUrl === void 0 ) worldUrl='../d/world.png';

    /*eslint no-console: 0 */
    var _ = {sphereObject: null};

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var mesh = topojson.mesh(_.world, _.world.objects.countries);
            var material = new THREE.MeshBasicMaterial({
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
        tj.rotate();
    }

    return {
        name: 'worldThreejs',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            this.worldThreejs.data(data);
        },
        onInit: function onInit() {
            this._.options.showLand = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showLand;
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
            } else {
                return  _.world;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
