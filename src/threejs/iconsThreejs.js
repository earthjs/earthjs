export default (jsonUrl, iconUrl) => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null};

    function meshCoordinate(mesh, sc) {
        const phi = ( 90 - mesh.coordinates[1]) * 0.017453292519943295; //Math.PI / 180.0;
        const the = (360 - mesh.coordinates[0]) * 0.017453292519943295; //Math.PI / 180.0;

        mesh.position.x = sc * Math.sin(phi) * Math.cos(the);
        mesh.position.y = sc * Math.cos(phi);
        mesh.position.z = sc * Math.sin(phi) * Math.sin(the);
        mesh.lookAt({x:0,y:0,z:0});
    }

    function loadIcons() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const group = new THREE.Group();
            const SCALE = this._.proj.scale();
            _.data.features.forEach(function(data) {
                const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
                const mesh = new THREE.Mesh(geometry, _.material);
                mesh.coordinates = data.geometry.coordinates;
                meshCoordinate(mesh, SCALE+1);
                mesh.scale.set(6,6,1);
                group.add(mesh);
            })
            _.sphereObject = group;
        }
        tj.addGroup(_.sphereObject);
    }

    function init() {
        const tj = this.threejsPlugin;
        this._.options.showIcons = true;
        _.material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            map: tj.texture(iconUrl)
        });
        if (_.data && !_.loaded) {
            loadIcons.call(this);
            tj.rotate();
        }
    }

    function create() {
        if (_.material && !_.loaded) {
            loadIcons.call(this);
        }
    }

    return {
        name: 'iconsThreejs',
        urls: jsonUrl && [jsonUrl],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
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
                _.data = data;
            } else {
                return _.data;
            }
        },
        scale(sc) {
            _.sphereObject.children.forEach(mesh=>{
                mesh.scale.set(sc+2,sc+2,1);
            });
        },
        sphere() {
            return _.sphereObject;
        }
    }
}
