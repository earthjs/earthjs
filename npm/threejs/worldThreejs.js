export default function (worldUrl) {
    if ( worldUrl === void 0 ) worldUrl='../d/world.png';

    /*eslint no-console: 0 */
    var _ = {
        world: null,
        land:  null,
        lakes:     {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[]},
        countries: {type: 'FeatureCollection', features:[]},
    };

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var mesh = topojson.mesh(_.world, _.world.objects.countries);
            var material = new THREE.MeshBasicMaterial({color: 0x707070});
            _.sphereObject = tj.wireframe(mesh, material);
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'worldThreejs',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showLand = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.land  = topojson.feature(data$1, data$1.objects.land);
                _.lakes.features = topojson.feature(data$1, data$1.objects.ne_110m_lakes).features;
                _.countries.features = topojson.feature(data$1, data$1.objects.countries).features;
            } else {
                return  _.world;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
