// view-source:http://callumprentice.github.io/apps/extruded_earth/index.html
export default (worldUrl='../d/countries.geo.json', landUrl='../d/gold.jpg', inner=0.9,outer=0, rtt=0) => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: new THREE.Object3D(), group: {}};

    function extrude(geometry,_i=0.9,_o=0) {
        const half = geometry.vertices.length / 2;
        geometry.vertices.forEach(function(vert, i) {
            let r = _i;
            if (i >= half) {
                r = 1+_o;
            }
            const phi= ( 90.0 - vert.oy) * 0.017453292519943295; //Math.PI / 180.0;
            const the= (360.0 - vert.ox) * 0.017453292519943295; //Math.PI / 180.0;
            vert.x = r * Math.sin(phi) * Math.cos(the);
            vert.y = r * Math.cos(phi);
            vert.z = r * Math.sin(phi) * Math.sin(the);
        });
        geometry.verticesNeedUpdate = true;
        geometry.computeFaceNormals();
    }

    function add_country(shape_points) {
        const shape = new THREE.Shape(shape_points);
        const geometry = new THREE.ExtrudeGeometry(shape,{
            bevelEnabled:false,
            amount: 16
        });
        geometry.vertices.forEach(function(vert) {
            vert.ox = vert.x;
            vert.oy = vert.y;
            vert.oz = vert.z;
        });
        extrude(geometry, inner, outer);
        return new THREE.Mesh(geometry, _.material);
    }

    function shapePoints(country, list) {
        const {id} = country, shape_points = [];
        let _g = _.group[id];
        if (_g===undefined) {
            _g = new THREE.Group();
            _g.name = id;
            _.group[id] = _g;
            _.sphereObject.add(_g);
        }
        list.forEach(function (points) {
            shape_points.push(new THREE.Vector2(points[0], points[1]));
        });
        _g.add(add_country(shape_points));
    }

    function loadCountry() {
        _.world.features.forEach(function(country) {
            const {coordinates} = country.geometry;
            if (coordinates.length === 1) {
                shapePoints(country, coordinates[0]);
            } else {
                coordinates.forEach(function(coord_set) {
                    if (coord_set.length == 1) {
                        shapePoints(country, coord_set[0]);
                    } else {
                        shapePoints(country, coord_set);
                    }
                });
            }
        });
    }

    function init() {
        const r = this._.proj.scale();
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
        const loader = new THREE.TextureLoader();
        loader.load(imgUrl, function(value) {
            const type = 't';
            const uniforms = {tMatCap:{type,value}};
            const material = new THREE.ShaderMaterial({
                uniforms,
                vertexShader,
                fragmentShader,
                shading: THREE.SmoothShading
            });
            cb.call(this, material);
        });
    }

    return {
        name: 'world3d2',
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
        group() {
            return _.group;
        },
        extrude(id, inner, outer) {
            _.group[id] && _.group[id].children.forEach(function(mesh) {
                extrude(mesh.geometry, inner, outer);
            });
        }
    }
}
