export default () => {
    const _ = {sphereObject: null, scale: null};

    function init() {
        this._.options.showDebugSpahre = true;
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

            refresh.call(this);
            this.threejsPlugin.addScene(_.sphereObject);
        }
    }

    function resize() {
        const sc = _.scale(this._.proj.scale());
        const se = _.sphereObject;
        se.scale.x = sc;
        se.scale.y = sc;
        se.scale.z = sc;
    }

    function refresh() {
        const rt = this._.proj.rotate();
        rt[0] -= 90;
        const q1 = this._.versor(rt);
        const q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        _.sphereObject.setRotationFromQuaternion(q2);
    }

    return {
        name: 'debugThreejs',
        onInit() {
            init.call(this);
        },
        onResize() {
            resize.call(this);
        },
        onRefresh() {
            if (_.sphereObject) {
                refresh.call(this);
            }
        }
    }
}
