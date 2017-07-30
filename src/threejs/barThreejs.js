// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default (urlBars,width=5) => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null, bars: null};
    const material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors,
        morphTargets: false,
        color: 0xaaffff,
    })

    function createGeometry(w) {
        const geometry = new THREE.BoxGeometry(5, 5, w);
        for (let i = 0; i < geometry.faces.length; i += 2 ) {
            const hex = Math.random() * 0xffffff;
            geometry.faces[ i ].color.setHex( hex );
            geometry.faces[ i + 1 ].color.setHex( hex );
        }
        return geometry;
    }

    function meshCoordinate(mesh, sc) {
        const phi = ( 90 - mesh.coordinates[1]) * 0.017453292519943295; //Math.PI / 180.0;
        const the = (360 - mesh.coordinates[0]) * 0.017453292519943295; //Math.PI / 180.0;

        mesh.position.x = sc * Math.sin(phi) * Math.cos(the);
        mesh.position.y = sc * Math.cos(phi);
        mesh.position.z = sc * Math.sin(phi) * Math.sin(the);
        mesh.lookAt({x:0,y:0,z:0});
    }

    function init() {
        this._.options.showBars = true;
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const group = new THREE.Group();
            const SCALE = this._.proj.scale();
            // const root = this.threejsPlugin.group().position;
            _.bars.features.forEach(function(bar) {
                const geometry = createGeometry(width);
                const mesh = new THREE.Mesh(geometry, material);
                mesh.coordinates = bar.geometry.coordinates;
                meshCoordinate(mesh, SCALE+(width/2));
                group.add(mesh);
            })
            _.sphereObject = group;
            _.sphereObject.visible = this._.options.showBars;
        }
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'barThreejs',
        urls: urlBars && [urlBars],
        onReady(err, data) {
            this.barThreejs.data(data);
        },
        onInit() {
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showBars;
        },
        data(data) {
            if (data) {
                if (_.valuePath) {
                    const p = _.valuePath.split('.');
                    data.features.forEach(d => {
                        let v = d;
                        p.forEach(o => v = v[o]);
                        d.geometry.value = v;
                    });
                }
                _.bars = data;
            } else {
                return _.bars;
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
