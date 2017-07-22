export default (imgUrl='../d/world.png') => {
    /*eslint no-console: 0 */
    let ext = imgUrl.split('.').pop();
    if (ext==='geojson') {
        ext = 'json';
    }
    const _ = {sphereObject: null, scale: null, ext};
    _.scale = d3.scaleLinear().domain([0,200]).range([0,1]);

    function create() {
        if (!_.sphereObject) {
            if (_.ext==='json') {
                worldFromTopojson.call(this);
            } else {
                worldFromImage.call(this);
            }
        }
    }

    function worldFromTopojson() {
        const tj = this.threejsPlugin;
        const material = new THREE.LineBasicMaterial({color: 0xff0000});
        _.sphereObject = tj.wireframe(topojson.mesh(_.world, _.world.objects.land), material);
        tj.addGroup(_.sphereObject, 'jsonGlobe');
        tj.rotate();
    }

    function worldFromImage() {
        const tj = this.threejsPlugin;
        const loader = new THREE.TextureLoader();
        loader.load(imgUrl, function(texture) {
            const geometry = new THREE.SphereGeometry( 200, 30, 30 );
            const material = new THREE.MeshBasicMaterial( {
                map: texture,
                overdraw: 0.5,
                opacity: 0
            } );
            material.opacity = 1;
            _.sphereObject = new THREE.Mesh( geometry, material );
            tj.addGroup(_.sphereObject, 'imageGlobe');
            tj.rotate();
        });
    }

    return {
        name: 'worldThreejs',
        urls: (_.ext==='json') && [imgUrl],
        onReady(err, data) {
            this.worldThreejs.data(data);
        },
        onCreate() {
            create.call(this);
        },
        data(data) {
            if (data) {
                _.world = data;
            } else {
                return  _.world;
            }
        },
    }
}
