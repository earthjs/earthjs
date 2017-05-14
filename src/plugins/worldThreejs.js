export default function() {
    const _ = {sphereObject: null};

    function addWorld() {
        if (!_.sphereObject) {
            const _this  = this;
            const group  = new THREE.Group();
            const loader = new THREE.TextureLoader();
            loader.load("./d/world.jpg", function(texture) {
                const geometry   = new THREE.SphereGeometry( 200, 20, 20 );
                const material   = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
                _.sphereObject = new THREE.Mesh( geometry, material );
                group.add(_.sphereObject);
                rotate.call(_this);
            });
            _this.threejsPlugin.addObject(group);
        }
    }

    function rotate() {
        const rt = this._.proj.rotate();
        rt[0] -= 90;
        const q1 = this._.versor(rt);
        const q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
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
