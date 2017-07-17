export default (imgUrl='../d/world.png') => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null, scale: null};
    _.scale = d3.scaleLinear().domain([0,200]).range([0,1]);

    function init() {
        if (!_.sphereObject) {
            const _this  = this;
            const group  = new THREE.Group();
            const loader = new THREE.TextureLoader();
            loader.load(imgUrl, function(texture) {
                const geometry = new THREE.SphereGeometry( 200, 30, 30 );
                const material = new THREE.MeshBasicMaterial( {
                    map: texture,
                    overdraw: 0.5,
                    opacity: 0
                } );
                material.opacity = 1;
                _.sphereObject = new THREE.Mesh( geometry, material );
                group.add(_.sphereObject);
                refresh.call(_this);
                // setTimeout(()=>d3.select('#three-js').attr('style', 'opacity: 1'),200);
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
