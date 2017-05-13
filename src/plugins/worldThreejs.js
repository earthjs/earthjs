export default function() {
    var _ = {sphereObject: null};

    function addWorld() {
        if (!_.sphereObject) {
            var _this  = this;
            var group  = new THREE.Group();
            var loader = new THREE.TextureLoader();
            loader.load("./d/world2.jpg", function(texture) {
                var geometry   = new THREE.SphereGeometry( 200, 20, 20 );
                var material   = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
                _.sphereObject = new THREE.Mesh( geometry, material );
                group.add(_.sphereObject);
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
