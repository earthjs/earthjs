export default function () {
    var _ = {sphereObject: null, scale: null};
    _.scale = d3.scaleLinear().domain([0,200]).range([0,1]);

    function init() {
        this._.options.showDebugSpahre = true;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
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

            refresh.call(this);
            this.threejsPlugin.addScene(_.sphereObject);
        }
    }

    function resize() {
        var sc = _.scale(this._.proj.scale());
        var se = _.sphereObject;
        se.scale.x = sc;
        se.scale.y = sc;
        se.scale.z = sc;
    }

    function refresh() {
        var rt = this._.proj.rotate();
        rt[0] -= 90;
        var q1 = this._.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        _.sphereObject.setRotationFromQuaternion(q2);
    }

    return {
        name: 'debugThreejs',
        onInit: function onInit() {
            init.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onRefresh: function onRefresh() {
            if (_.sphereObject) {
                refresh.call(this);
            }
        }
    }
}
