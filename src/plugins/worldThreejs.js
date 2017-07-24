export default (imgUrl='../d/world.png') => {
    /*eslint no-console: 0 */
    let ext = imgUrl.split('.').pop();
    if (ext==='geojson') {
        ext = 'json';
    }
    const _ = {sphereObject: null, scale: null, ext};

    function create() {
        if (!_.sphereObject) {
            if (_.ext==='json') {
                worldFromTopojson.call(this);
            } else {
                worldFromImage.call(this);
            }
        } else {
            const tj = this.threejsPlugin;
            tj.addGroup(_.sphereObject);
        }
    }
    function updateGlobe(tj, obj) {
        _.sphereObject = obj;
        _.sphereObject.visible = this._.options.showLand;
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    function worldFromTopojson() {
        const tj = this.threejsPlugin;
        const mesh = topojson.mesh(_.world, _.world.objects.land);
        const material = new THREE.LineBasicMaterial({color: 0xff0000});
        updateGlobe.call(this, tj, tj.wireframe(mesh, material));
    }

    function worldFromImage() {
        const tj = this.threejsPlugin;
        (new THREE.TextureLoader()).loader.load(imgUrl, function(texture) {
            const geometry = new THREE.SphereGeometry( 200, 30, 30 );
            const material = new THREE.MeshBasicMaterial( {
                map: texture,
                overdraw: 0.5,
                opacity: 0
            } );
            material.opacity = 1;
            updateGlobe.call(this, tj, new THREE.Mesh(geometry, material));
        });
    }

    return {
        name: 'worldThreejs',
        urls: (_.ext==='json') && [imgUrl],
        onReady(err, data) {
            this.worldThreejs.data(data);
        },
        onInit() {
            this._.options.showLand = true;
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showLand;
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
