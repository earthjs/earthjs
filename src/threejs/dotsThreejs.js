// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
// https://stackoverflow.com/questions/22028288/how-to-optimize-rendering-of-many-spheregeometry-in-three-js
// https://threejs.org/docs/#api/materials/PointsMaterial
export default urlJson => {
    /*eslint no-console: 0 */
    const _ = {
        dataDots: null,
        onHover: {},
        onHoverVals: [],
};

    function createDot(feature, r) {
        const tj = this.threejsPlugin,
        material = new THREE.MeshBasicMaterial({
            color: feature.geometry.color || 0xC19999, //F0C400,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            opacity: 0.5,
        }),
        radius   = (feature.geometry.radius || 0.5) * 10,
        geometry = new THREE.CircleBufferGeometry(radius, 25),
        mesh     = new THREE.Mesh(geometry, material),
        position = tj.vertex(feature.geometry.coordinates, r);
        mesh.position.set(position.x, position.y, position.z);
        mesh.lookAt({x:0,y:0,z:0});
        return mesh;
    }

    function hover(event){
        for (let v of _.onHoverVals) {
            v.call(event.target, event);
        }
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const r = this._.proj.scale() + (this.__plugins('3d').length>0 ? 4 : 0);
            _.sphereObject = new THREE.Group();
            _.sphereObject.name = _.me.name;
            _.dataDots.features.forEach((d) => {
                const dot = createDot.call(this, d, r);
                dot.__data__ = d;
                _.sphereObject.add(dot);
                if (tj.domEvents) {
                    tj.domEvents.addEventListener(dot, 'mousemove', hover, false);
                }
            });
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'dotsThreejs',
        urls: urlJson && [urlJson],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
        },
        onCreate() {
            create.call(this);
        },
        data(data) {
            if (data) {
                _.dataDots = data;
            } else {
                return _.dataDots;
            }
        },
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(k => _.onHover[k]);
        },
        sphere() {
            return _.sphereObject;
        },
        // color(c) {
        //     material.color.set(c);
        //     material.needsUpdate = true;
        //     this.threejsPlugin.renderThree();
        // }
    }
}
