// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
export default function() {
    var _ = {renderer: null, scene: null, camera: null, scale: null, sphereObject: null};

    function addSphereObject() {
        if (!_.sphereObject) {
            // Create 3D scene and camera objects.
            const SCALE = this._.proj.scale();

            // Create sphere.
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

            var r = this._.proj.rotate();
            var TO_RADIAN = Math.PI / 180;
            _.sphereObject.rotation.y = r[0] * TO_RADIAN;
            _.scene.add(_.sphereObject);
        }
    }

    function rotate() {

    }

    function renderThree() {
        if (this._.options.showThree) {
            _.renderer.render(_.scene, _.camera);
        }
    }

    return {
        name: 'threejsPlugin',
        onInit() {
            const
                width = this._.options.width,
                height= this._.options.height;
            _.scene  = new THREE.Scene()
            _.yAxis  = new THREE.Vector3(0,1,0);
            _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10000)
            _.camera.position.z = 500 // (higher than RADIUS + size of the bubble)

            // Create renderer object.
            _.renderer = new THREE.WebGLRenderer({antialias: true});
            _.renderer.domElement.id = 'shade-layer';
            _.renderer.setClearColor('white', 1);
            _.renderer.setSize(width, height);
            document.body.appendChild(_.renderer.domElement)

            this._.options.showThree = true;
            this.renderThree = renderThree;
            addSphereObject.call(this);
        },
        onRefresh() {
            if (this._.three) {
                var q1 = this._.three;
                var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
                _.sphereObject.setRotationFromQuaternion(q2);
                this._.three = null;
            } else if (!this._.drag){
                var q1 = this._.versor(this._.proj.rotate());
                var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
                _.sphereObject.setRotationFromQuaternion(q2);
                // _.sphereObject.rotateOnAxis(_.yAxis, 0.0089);
            }
            renderThree.call(this);
        }
    }
}
