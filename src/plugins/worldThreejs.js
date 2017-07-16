export default (imgUrl='../d/world.jpg') => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null, scale: null};
    _.scale = d3.scaleLinear().domain([0,200]).range([0,1]);

    function init() {
        if (!_.sphereObject) {
            const _this  = this;
            const group  = new THREE.Group();
            const loader = new THREE.TextureLoader();
            loader.load(imgUrl, function(texture) {
                const geometry = new THREE.SphereGeometry( 200, 20, 20 );
                const material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
                _.sphereObject = new THREE.Mesh( geometry, material );
                window.se = _.sphereObject;
                group.add(_.sphereObject);
                refresh.call(_this);
            });
            _this.threejsPlugin.addObject(group);
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
        name: 'worldThreejs',
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
