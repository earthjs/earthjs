// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
// https://stackoverflow.com/questions/22028288/how-to-optimize-rendering-of-many-spheregeometry-in-three-js
// https://threejs.org/docs/#api/materials/PointsMaterial
export default (urlJson) => { //imgUrl='../globe/point3.png'
    /*eslint no-console: 0 */
    const _ = {
        dataPoints: null,
        onHover: {},
        onHoverVals: [],
};

    function init() {
        this._.options.showPoints = true;
    }

    function hover(event){
        for (var v of _.onHoverVals) {
            v.call(event.target, event);
        }
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const particles = new THREE.Geometry();
            _.dataPoints.features.forEach((d) => {
                const star = new THREE.Vector3();
                const position = tj.vertex(d.geometry.coordinates);
                star.x = position.x;
                star.y = position.y;
                star.z = position.z;
                particles.vertices.push( star );
            });
            const pMaterial = new THREE.PointsMaterial({
                // blending: THREE.AdditiveBlending,
                // map: tj.texture(imgUrl),
                // transparent: true,
                // depthTest: false,
                color: 0xff0000,
                size: 30
             });
            const starField = new THREE.Points( particles, pMaterial );
            _.sphereObject = starField;
            _.sphereObject.name = _.me.name;
            if (tj.domEvents) {
                tj.domEvents.addEventListener(starField, 'mousemove', hover, false);
            }
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'pointsThreejs',
        urls: urlJson && [urlJson],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        data(data) {
            if (data) {
                _.dataPoints = data;
            } else {
                return _.dataPoints;
            }
        },
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(k => _.onHover[k]);
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
