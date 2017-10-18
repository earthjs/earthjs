// import data from './globe';
import Map3DGeometry from './map3d';
export default (worldUrl='../d/world.geometry.json', imgUrl='../globe/gold.jpg', inner=0.9, rtt=-1.57) => {
    /*eslint no-console: 0 */
    const _ = {
        style: {},
        tween: null,
        sphereObject: new THREE.Group(),
    };
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
}`;
    const fragmentShader = `
uniform sampler2D sampler;
uniform vec3 diffuse;
varying vec2 vN;
void main() {
vec4 tex = texture2D( sampler, vN );
gl_FragColor = tex + vec4( diffuse, 0 ) * 0.5;
}`;
    function init() {
        const tj = this.threejsPlugin;
        const r = this._.proj.scale()+5;
        this._.options.showWorld = true;
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(r,r,r);
        _.sphereObject.name = _.me.name;
        _.uniforms = {
            sampler: {type: 't', value: tj.texture(imgUrl)},
            diffuse: {type: 'c', value: new THREE.Color(_.style.land || 'black')},
        };
    }

    let material, uniforms;
    function loadCountry() {
        const data = _.world;
        uniforms = _.uniforms;
        const {choropleth} = this._.options;
        material = new THREE.ShaderMaterial({uniforms, vertexShader, fragmentShader});
        for (let name in data) {
            if (choropleth) {
                const properties = data[name].properties || {color: _.style.countries};
                const diffuse = {type: 'c', value: new THREE.Color(properties.color || 'black')};
                uniforms = Object.assign({}, _.uniforms, {diffuse});
                material = new THREE.ShaderMaterial({uniforms, vertexShader, fragmentShader});
            }
            const geometry = new Map3DGeometry(data[name], inner);
            _.sphereObject.add(data[name].mesh = new THREE.Mesh(geometry, material));
        }
    }

    function create() {
        loadCountry.call(this);
        const tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
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
            Object.defineProperty(me, 'tween', {
                get: () => _.tween,
                set: (x) => {
                    _.tween = x;
                    // this.__addEventQueue(_.me.name, 'onTween');
                }
            });
        },
        onCreate() {
            create.call(this);
        },
        onTween() {
            _.tween && _.tween.call(this);
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
        style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        extrude(inner) {
            for (let name in _.world) {
                const dataItem = _.world[name];
                dataItem.mesh.geometry = new Map3DGeometry(dataItem, inner);
            }
        }
    }
}
