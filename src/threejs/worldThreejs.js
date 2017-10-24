export default (worldUrl='../globe/world.png') => {
    /*eslint no-console: 0 */
    const _ = {
        world: null,
        land:  null,
        lakes:     {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[]},
        countries: {type: 'FeatureCollection', features:[]},
    };

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const mesh = topojson.mesh(_.world, _.world.objects.countries);
            const material = new THREE.MeshBasicMaterial({color: 0x707070});
            _.sphereObject = tj.wireframe(mesh, material);
            // _.sphereObject.scale.set(1.02,1.02,1.02);
            _.sphereObject.name = _.me.name;
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'worldThreejs',
        urls: worldUrl && [worldUrl],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            this._.options.showLand = true;
        },
        onCreate() {
            create.call(this);
        },
        data(data) {
            if (data) {
                _.world = data;
                _.land  = topojson.feature(data, data.objects.land);
                _.countries.features = topojson.feature(data, data.objects.countries).features;
                if (data.objects.ne_110m_lakes)
                    _.lakes.features = topojson.feature(data, data.objects.ne_110m_lakes).features;
            } else {
                return  _.world;
            }
        },
        allData(all) {
            if (all) {
                _.world     = all.world;
                _.land      = all.land;
                _.lakes     = all.lakes;
                _.countries = all.countries;
            } else {
                const  {world, land, lakes, countries} = _;
                return {world, land, lakes, countries};
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
