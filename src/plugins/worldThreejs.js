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

    function worldFromTopojson() {
        const tj = this.threejsPlugin;
        const material = new THREE.LineBasicMaterial({color: 0xff0000});
        _.sphereObject = tj.wireframe(topojson.mesh(_.world, _.world.objects.land), material);
        _.sphereObject.visible = this._.options.showLand;
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    function worldFromImage() {
        const __ = this._;
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
            _.sphereObject.visible = __.options.showLand;
            tj.addGroup(_.sphereObject);
            tj.rotate();
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
