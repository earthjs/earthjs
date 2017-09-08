export default function () {
    var _ = {sphereObject: null, scale: null};

    function init() {
        this._.options.showDebugSpahre = true;
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            _.scale = d3.scaleLinear().domain([0,SCALE]).range([0,1]);
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
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'debugThreejs',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
