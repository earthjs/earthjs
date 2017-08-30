// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default (color) => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null}
    if (color) {
        _.material = new THREE.MeshBasicMaterial({
            transparent: true,
            color: color, //'#555',
        });
    } else {
        _.material = new THREE.MeshNormalMaterial({
            transparent: false,
            wireframe: false,
            opacity: 0.8,
        });
    }

    function init() {
        const o = this._.options;
        o.showOcean = true;
        o.transparentOcean = false;
    }

    function create() {
        const o = this._.options;
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const SCALE = this._.proj.scale();
            const geometry = new THREE.SphereGeometry(SCALE, 30, 30);
            _.sphereObject = new THREE.Mesh(geometry, _.material);
        }
        _.material.transparent = (o.transparent || o.transparentOcean);
        _.sphereObject.visible = o.showOcean;
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'oceanThreejs',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showOcean;
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
