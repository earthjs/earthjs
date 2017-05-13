export default function() {
    var _ = {sphereObject: null};

    function addDebugSphere() {
        if (!_.sphereObject) {
            const SCALE = this._.proj.scale();
            var sphere         = new THREE.SphereGeometry(SCALE, 100, 100);
            var sphereMaterial = new THREE.MeshNormalMaterial({wireframe: false});
            var sphereMesh     = new THREE.Mesh(sphere, sphereMaterial);

            // For debug ...
            var dot1 = new THREE.SphereGeometry(30, 10, 10);
            var dot2 = new THREE.SphereGeometry(30, 10, 10);
            var dot3 = new THREE.SphereGeometry(30, 10, 10);
            dot1.translate(0, 0, SCALE);
            dot2.translate(SCALE, 0, 0);
            dot3.translate(0,-SCALE, 0);
            var dot1Material = new THREE.MeshBasicMaterial({color: 'blue' });
            var dot2Material = new THREE.MeshBasicMaterial({color: 'red'  });
            var dot3Material = new THREE.MeshBasicMaterial({color: 'green'});
            var dot1Mesh = new THREE.Mesh(dot1, dot1Material);
            var dot2Mesh = new THREE.Mesh(dot2, dot2Material);
            var dot3Mesh = new THREE.Mesh(dot3, dot3Material);

            _.sphereObject = new THREE.Object3D();
            _.sphereObject.add(sphereMesh, dot1Mesh, dot2Mesh, dot3Mesh);

            rotate.call(this);
            this.threejsPlugin.addObject(_.sphereObject);
        }
    }

    function rotate() {
        var rt = this._.proj.rotate();
        rt[0] -= 90;
        var q1 = this._.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        _.sphereObject.setRotationFromQuaternion(q2);
    }

    return {
        name: 'debugThreejs',
        onInit() {
            this._.options.showDebugSpahre = true;
            addDebugSphere.call(this);
        },
        onRefresh() {
            if (_.sphereObject) {
                rotate.call(this);
            }
        }
    }
}
