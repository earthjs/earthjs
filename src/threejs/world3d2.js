// view-source:http://callumprentice.github.io/apps/extruded_earth/index.html
export default (worldUrl='../d/countries.geo.json', landUrl='../globe/gold.jpg', inner=0.9,outer=0, rtt=0) => {
    /*eslint no-console: 0 */
    const _ = {
        group: {},
        sphereObject: null,
        material: new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xaa9933),
            side: THREE.DoubleSide
        })
    };

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

    let material;
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
        return new THREE.Mesh(geometry, material);
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
        const mesh = add_country(shape_points);
        mesh.cid = country.properties.cid;
        _g.add(mesh);
    }

    function loadCountry() {
        const {choropleth} = this._.options;
        _.world.features.forEach(function(country) {
            const {coordinates} = country.geometry;
            if (choropleth) {
                material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(country.properties.color || 'rgb(2, 20, 37)'),
                    side: THREE.DoubleSide
                })
            } else {
                material = _.material;
            }
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

    function create() {
        this.threejsPlugin.addGroup(_.sphereObject);
        loadCountry.call(this);
    }

    function init() {
        const r = this._.proj.scale();
        this._.options.showWorld = true;
        _.sphereObject = this.threejsPlugin.light3d();
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(r,r,r);
        _.sphereObject.name = _.me.name;
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
