// import data from './globe';
import Map3DGeometry from './map3d';
export default function (worldUrl, landUrl, rtt) {
    if ( worldUrl === void 0 ) worldUrl='../d/world_geometry.json';
    if ( landUrl === void 0 ) landUrl='../d/gold.jpg';
    if ( rtt === void 0 ) rtt=-1.57;

    /*eslint no-console: 0 */
    var _ = {sphereObject: new THREE.Object3D()};

    function loadCountry() {
        var data = _.world;
        for (var name in data) {
            var geometry = new Map3DGeometry(data[name], 0.9);
            _.sphereObject.add(data[name].mesh = new THREE.Mesh(geometry, _.material));
        }
        _.loaded = true;
    }

    function init() {
        var r = this._.proj.scale()+5;
        this._.options.showWorld = true;
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(r,r,r);
        makeEnvMapMaterial(landUrl, function(material) {
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
        var tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    var vertexShader = "\n    varying vec2 vN;\n    void main() {\n        vec4 p = vec4( position, 1. );\n        vec3 e = normalize( vec3( modelViewMatrix * p ) );\n        vec3 n = normalize( normalMatrix * normal );\n        vec3 r = reflect( e, n );\n        float m = 2. * length( vec3( r.xy, r.z + 1. ) );\n        vN = r.xy / m + .5;\n        gl_Position = projectionMatrix * modelViewMatrix * p;\n    }\n    "
    var fragmentShader = "\n    uniform sampler2D tMatCap;\n    varying vec2 vN;\n    void main() {\n        vec3 base = texture2D( tMatCap, vN ).rgb;\n        gl_FragColor = vec4( base, 1. );\n    }\n    "
    function makeEnvMapMaterial(imgUrl, cb) {
        var loader = new THREE.TextureLoader();
        loader.load(imgUrl, function(value) {
            var type = 't';
            var shading  = THREE.SmoothShading;
            var uniforms = {tMatCap:{type: type,value: value}};
            var material = new THREE.ShaderMaterial({shading: shading, uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader});
            cb.call(this, material);
        });
    }

    return {
        name: 'world3d',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        rotate: function rotate(rtt) {
            _.sphereObject.rotation.y = rtt;
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
            } else {
                return  _.world;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
