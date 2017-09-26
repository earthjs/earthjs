// import data from './globe';
import Map3DGeometry from './map3d';
export default (worldUrl='../d/world.geometry.json', landUrl='../globe/gold.jpg', inner=0.9, rtt=-1.57) => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: new THREE.Object3D()};

    function loadCountry() {
        const data = _.world;
        for (var name in data) {
            var geometry = new Map3DGeometry(data[name], inner);
            _.sphereObject.add(data[name].mesh = new THREE.Mesh(geometry, _.material));
        }
        _.loaded = true;
    }

    function init() {
        const r = this._.proj.scale()+5;
        this._.options.showWorld = true;
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(r,r,r);
        makeEnvMapMaterial.call(this, landUrl, function(material) {
            _.material = material;
            if (_.world && !_.loaded) {
                loadCountry()
            }
        });
    }

    function create() {
        if (_.material && !_.loaded) {
            loadCountry()
        }
        _.sphereObject.name = _.me.name;
        const tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    const vertexShader = `
    varying vec2 vN;
    void main() {
        vec4 p = vec4( position, 1. );
        vec3 e = normalize( vec3( modelViewMatrix * p ) );
        vec3 n = normalize( normalMatrix * normal );
        vec3 r = reflect( e, n );
        float m = 2. * length( vec3( r.xy, r.z + 1. ) );
        vN = r.xy / m + .5;
        gl_Position = projectionMatrix * modelViewMatrix * p;
    }
    `
    const fragmentShader = `
    uniform sampler2D tMatCap;
    varying vec2 vN;
    void main() {
        vec3 base = texture2D( tMatCap, vN ).rgb;
        gl_FragColor = vec4( base, 1. );
    }
    `
    function makeEnvMapMaterial(imgUrl, cb) {
        const type = 't';
        const tj = this.threejsPlugin;
        const shading  = THREE.SmoothShading;
        const uniforms = {tMatCap:{type,value: tj.texture(imgUrl)}};
        const material = new THREE.ShaderMaterial({
            shading,
            uniforms,
            vertexShader,
            fragmentShader
        });
        cb.call(this, material);
    }

    return {
        name: 'world3d',
        urls: worldUrl && [worldUrl],
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
        rotate(rtt) {
            _.sphereObject.rotation.y = rtt;
        },
        data(data) {
            if (data) {
                _.world = data;
            } else {
                return  _.world;
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
