export default () => {
    const _ = {sphereObject: null, scale: null};

    function init() {
        this._.options.showDebugSpahre = true;
    }

    function create() {
        const o = this._.options;
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const SCALE = this._.proj.scale();
            _.scale = d3.scaleLinear().domain([0,SCALE]).range([0,1]);
            const sphere         = new THREE.SphereGeometry(SCALE, 100, 100);
            const sphereMaterial = new THREE.MeshNormalMaterial({wireframe: false});
            const sphereMesh     = new THREE.Mesh(sphere, sphereMaterial);

            // For debug ...
            const dot1 = new THREE.SphereGeometry(30, 10, 10);
            const dot2 = new THREE.SphereGeometry(30, 10, 10);
            const dot3 = new THREE.SphereGeometry(30, 10, 10);
            dot1.translate(0, 0, SCALE);
            dot2.translate(SCALE, 0, 0);
            dot3.translate(0,-SCALE, 0);
            const dot1Material = new THREE.MeshBasicMaterial({color: 'blue' });
            const dot2Material = new THREE.MeshBasicMaterial({color: 'red'  });
            const dot3Material = new THREE.MeshBasicMaterial({color: 'green'});
            const dot1Mesh = new THREE.Mesh(dot1, dot1Material);
            const dot2Mesh = new THREE.Mesh(dot2, dot2Material);
            const dot3Mesh = new THREE.Mesh(dot3, dot3Material);

            _.sphereObject = new THREE.Object3D();
            _.sphereObject.add(sphereMesh, dot1Mesh, dot2Mesh, dot3Mesh);
        }
        _.sphereObject.visible = o.showDebugSpahre;
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'debugThreejs',
        onInit() {
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showDebugSpahre;
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
