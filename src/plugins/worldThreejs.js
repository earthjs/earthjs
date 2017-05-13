export default function() {
    var _ = {sphereObject: null};

    function addWorld() {
        if (!_.sphereObject) {
            // Create world.
            var _this = this;
            // const SCALE = this._.proj.scale();

            var group = new THREE.Group();
            var loader = new THREE.TextureLoader();
            loader.load("./d/world2.jpg", function(texture) {
                // world.minFilter = THREE.LinearFilter;
                // var geometry  = new THREE.SphereGeometry(SCALE, 100, 100);
                var geometry   = new THREE.SphereGeometry( 200, 20, 20 );
                var material   = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
                _.sphereObject = new THREE.Mesh( geometry, material );
                group.add(_.sphereObject);

                // var sphereMaterial = new THREE.MeshNormalMaterial({wireframe: false});
                // var material  = new THREE.MeshPhongMaterial({map: texture, shininess: 50});
                // var sphereMesh= new THREE.Mesh(geometry, material);

                // _.sphereObject = new THREE.Object3D();
                // _.sphereObject.add(sphereMesh);

                rotate.call(_this);
            });
            _this.threejsPlugin.addObject(group);
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
        name: 'worldThreejs',
        onInit() {
            addWorld.call(this);
        },
        onRefresh() {
            if (_.sphereObject) {
                rotate.call(this);
            }
        }
    }
}
