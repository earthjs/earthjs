// import data from './globe';
import Map3DGeometry from './map3d';
export default function (worldUrl, imgUrl, inner, rtt) {
    if ( worldUrl === void 0 ) worldUrl='../d/world.geometry.json';
    if ( imgUrl === void 0 ) imgUrl='../globe/gold.jpg';
    if ( inner === void 0 ) inner=0.9;
    if ( rtt === void 0 ) rtt=-1.57;

    /*eslint no-console: 0 */
    var _ = {
        style: {},
        tween: null,
        sphereObject: new THREE.Group(),
    };
    var vertexShader = "\nvarying vec2 vN;\nvoid main() {\nvec4 p = vec4( position, 1. );\nvec3 e = normalize( vec3( modelViewMatrix * p ) );\nvec3 n = normalize( normalMatrix * normal );\nvec3 r = reflect( e, n );\nfloat m = 2. * length( vec3( r.xy, r.z + 1. ) );\nvN = r.xy / m + .5;\ngl_Position = projectionMatrix * modelViewMatrix * p;\n}";
    var fragmentShader = "\nuniform sampler2D sampler;\nuniform vec3 diffuse;\nvarying vec2 vN;\nvoid main() {\nvec4 tex = texture2D( sampler, vN );\ngl_FragColor = tex + vec4( diffuse, 0 ) * 0.5;\n}";
    function init() {
        var tj = this.threejsPlugin;
        var r = this._.proj.scale()+5;
        this._.options.showWorld = true;
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(r,r,r);
        _.sphereObject.name = _.me.name;
        _.uniforms = {
            sampler: {type: 't', value: tj.texture(imgUrl)},
            diffuse: {type: 'c', value: new THREE.Color(_.style.land || 'black')},
        };
    }

    var material, uniforms;
    function loadCountry() {
        var data = _.world;
        uniforms = _.uniforms;
        var ref = this._.options;
        var choropleth = ref.choropleth;
        material = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader});
        for (var name in data) {
            if (choropleth) {
                var properties = data[name].properties || {color: _.style.countries};
                var diffuse = {type: 'c', value: new THREE.Color(properties.color || 'black')};
                uniforms = Object.assign({}, _.uniforms, {diffuse: diffuse});
                material = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader});
            }
            var geometry = new Map3DGeometry(data[name], inner);
            _.sphereObject.add(data[name].mesh = new THREE.Mesh(geometry, material));
        }
    }

    function create() {
        loadCountry.call(this);
        var tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
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
            Object.defineProperty(me, 'tween', {
                get: function () { return _.tween; },
                set: function (x) {
                    _.tween = x;
                    // this.__addEventQueue(_.me.name, 'onTween');
                }
            });
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onTween: function onTween() {
            _.tween && _.tween.call(this);
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
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        extrude: function extrude(inner) {
            for (var name in _.world) {
                var dataItem = _.world[name];
                dataItem.mesh.geometry = new Map3DGeometry(dataItem, inner);
            }
        }
    }
}
