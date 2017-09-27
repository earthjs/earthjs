// http://callumprentice.github.io/apps/flight_stream/index.html
// https://stackoverflow.com/questions/9695687/javascript-converting-colors-numbers-strings-vice-versa
export default (jsonUrl, imgUrl, height=150) => {
    /*eslint no-console: 0 */
    const _ = {
        data: [],
        sphereObject: null,
        track_lines_object: null,
        track_points_object: null,
        lightFlow: true,
        linewidth:  3,
        texture: null,
        maxVal: 1,
        onHover: {},
        onHoverVals: [],
    };
    const lineScale = d3.scaleLinear().domain([30,2500]).range([0.001, 0.005]);
    const PI180 = Math.PI / 180.0;

    let colorRange = [d3.rgb('#ff0000'),d3.rgb("#aaffff")];
    let min_arc_distance = +Infinity;
    let max_arc_distance = -Infinity;
    let cur_arc_distance = 0;
    let point_spacing = 100;
    let point_opacity = 0.8;
    let point_speed = 1.0;
    let point_cache = [];
    let all_tracks = [];

    let ttl_num_points = 0;
    function generateControlPoints(radius) {
        for (let f = 0; f < _.data.length; ++f) {
            const start_lat = _.data[f][0];
            const start_lng = _.data[f][1];
            const end_lat   = _.data[f][2];
            const end_lng   = _.data[f][3];
            const value     = _.data[f][4];

            if (start_lat === end_lat && start_lng === end_lng) {
                continue;
            }

            let points = [];
            const spline_control_points = 8;
            const max_height = Math.random() * height + 0.05;
            for (let i = 0; i < spline_control_points + 1; i++) {
                const arc_angle = i * 180.0 / spline_control_points;
                const arc_radius = radius + (Math.sin(arc_angle * PI180)) * max_height;
                const latlng = lat_lng_inter_point(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);
                const pos = xyz_from_lat_lng(latlng.lat, latlng.lng, arc_radius);

                points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
            }

            let point_positions = [];
            const spline = new THREE.CatmullRomCurve3(points);
            const arc_distance = lat_lng_distance(start_lat, start_lng, end_lat, end_lng, radius);
            for (let t = 0; t < arc_distance; t += point_spacing) {
                const offset = t / arc_distance;
                point_positions.push(spline.getPoint(offset));
            }

            const arc_distance_miles = (arc_distance / (2 * Math.PI)) * 24901;
            if (arc_distance_miles < min_arc_distance) {
                min_arc_distance = arc_distance_miles;
            }

            if (arc_distance_miles > max_arc_distance) {
                max_arc_distance = parseInt(Math.ceil(arc_distance_miles / 1000.0) * 1000);
                cur_arc_distance = max_arc_distance;
            }
            const color = value ? _.color(value) : 'rgb(255,255,255)';
            const default_speed = Math.random()*600+400;
            const speed = default_speed * point_speed;
            const num_points = parseInt(arc_distance / point_spacing) + 1;
            const spd_points = speed * num_points;
            ttl_num_points += num_points;

            all_tracks.push({
                spline,
                num_points,
                spd_points,
                arc_distance,
                arc_distance_miles,
                point_positions,
                default_speed,
                value,
                color,
                speed
            });
        }
    }

    function xyz_from_lat_lng(lat, lng, radius) {
        const phi = (90 - lat) * PI180;
        const theta = (360 - lng) * PI180;
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    }

    function lat_lng_distance(lat1, lng1, lat2, lng2, radius) {
        const a = Math.sin(((lat2 - lat1) * PI180) / 2) *
            Math.sin(((lat2 - lat1) * PI180) / 2) +
            Math.cos(lat1 * PI180) *
            Math.cos(lat2 * PI180) *
            Math.sin(((lng2 - lng1) * PI180) / 2) *
            Math.sin(((lng2 - lng1) * PI180) / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
    }

    function lat_lng_inter_point(lat1, lng1, lat2, lng2, offset) {
        lat1 = lat1 * PI180;
        lng1 = lng1 * PI180;
        lat2 = lat2 * PI180;
        lng2 = lng2 * PI180;

        const d = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin((lat1 - lat2) / 2)), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));
        const A = Math.sin((1 - offset) * d) / Math.sin(d);
        const B = Math.sin(offset * d) / Math.sin(d);
        const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
        const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);
        const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
        const lng = Math.atan2(y, x) * 180 / Math.PI;

        return {
            lat: lat,
            lng: lng
        };
    }

    let positions;
    function generate_point_cloud() {
        positions = new Float32Array(ttl_num_points * 3);
        const colors = new Float32Array(ttl_num_points * 3);
        const values = new Float32Array(ttl_num_points);
        const sizes = new Float32Array(ttl_num_points);

        let index = 0;
        for (let i = 0; i < all_tracks.length; ++i) {
            const {value, color, point_positions} = all_tracks[i];
            const {r,g,b} = new THREE.Color(color); //.setHSL(1-value/_.maxVal, 0.4, 0.8);
            const pSize = _.point(value || 1);
            for (let j = 0; j < point_positions.length; ++j) {

                positions[3 * index + 0] = 0;
                positions[3 * index + 1] = 0;
                positions[3 * index + 2] = 0;

                colors[3 * index + 0] = r;
                colors[3 * index + 1] = g;
                colors[3 * index + 2] = b;
                values[index] = value || 1;
                sizes[index] = pSize; //_.point_size;

                ++index;
            }
            point_cache[i] = [];
        }

        const point_cloud_geom = new THREE.BufferGeometry();
        point_cloud_geom.addAttribute('position',    new THREE.BufferAttribute(positions, 3));
        point_cloud_geom.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        point_cloud_geom.addAttribute('value',       new THREE.BufferAttribute(values, 1));
        point_cloud_geom.addAttribute('size',        new THREE.BufferAttribute(sizes, 1));
        point_cloud_geom.computeBoundingBox();

        _.track_points_object = new THREE.Points(point_cloud_geom, _.shaderMaterial);
        _.attr_position = _.track_points_object.geometry.attributes.position;
        return _.track_points_object;
    }

    function update_point_cloud() {
        const i_length = all_tracks.length;
        const dates = Date.now();
        let index = 0;
        for (let i= 0; i < i_length; ++i) {
            const {
                speed,
                spline,
                num_points,
                spd_points,
                arc_distance,
                arc_distance_miles
            } = all_tracks[i];

            if (arc_distance_miles <= cur_arc_distance) {
                const normalized = point_spacing / arc_distance;
                const time_scale = (dates % speed) / spd_points;
                for (let j = 0; j < num_points; j++) {
                    const  t = j * normalized + time_scale;
                    const {x,y,z}= fast_get_spline_point(i, t, spline);
                    const index3 = 3 * index;
                    positions[index3 + 0] = x;
                    positions[index3 + 1] = y;
                    positions[index3 + 2] = z;
                    index++;
                }
            } else {
                for (let j = 0; j < num_points; j++) {
                    const index3 = 3 * index;
                    positions[index3 + 0] = Infinity;
                    positions[index3 + 1] = Infinity;
                    positions[index3 + 2] = Infinity;
                    index++;
                }

            }
        }
        _.attr_position.needsUpdate = true;
    }

    function fast_get_spline_point(i, t, spline) {
        // point_cache set in generate_point_cloud()
        const pcache = point_cache[i];
        const tc = parseInt(t * 1000);
        if (pcache[tc] === undefined) {
            pcache[tc] = spline.getPoint(t);
        }
        return pcache[tc];
    }

    const line_opacity = 0.4;
    const curve_points =  24;
    const curve_length =  curve_points - 1;
    const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        opacity: line_opacity,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        color: 0xffffff,
        linewidth: _.linewidth
    });
    function generate_track_lines() {
        const {length}  = all_tracks;
        const total_arr = length * 6 * curve_points;
        const geometry  = new THREE.BufferGeometry();
        const colors    = new Float32Array(total_arr);
        const line_positions = new Float32Array(total_arr);

        for (let i = 0; i < length; ++i) {
            const l = i * curve_points;
            const {spline, color} = all_tracks[i];
            const {r,g,b} = new THREE.Color(color);
            for (let j = 0; j < curve_length; ++j) {
                const k = j+1;
                const c1 = spline.getPoint(j / curve_length);
                const c2 = spline.getPoint(k / curve_length);
                line_positions[i_curve + 0] = c1.x;
                line_positions[i_curve + 1] = c1.y;
                line_positions[i_curve + 2] = c1.z;
                line_positions[i_curve + 3] = c2.x;
                line_positions[i_curve + 4] = c2.y;
                line_positions[i_curve + 5] = c2.z;

                const i_curve = (j + l) * 6;
                colors[i_curve + 0] = r;
                colors[i_curve + 1] = g;
                colors[i_curve + 2] = b;
                colors[i_curve + 3] = r;
                colors[i_curve + 4] = g;
                colors[i_curve + 5] = b;
            }
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(line_positions, 3));
        geometry.addAttribute('color',    new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();
        _.track_lines_object = new THREE.Line(geometry, material, THREE.LineSegments);

        return _.track_lines_object;
    }

    // const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    function generate_track_lines2() {
        const {length}= all_tracks;
        const group = new THREE.Group();
        const lineWidth = lineScale(this._.proj.scale());
        for (let i = 0; i < length; ++i) {
            const {spline, color} = all_tracks[i];
            const lines = new Float32Array(3 * curve_points);
            const material = new MeshLineMaterial({
                color: new THREE.Color(color),
                useMap: false,
                opacity: 1,
                lineWidth,
                // near: this._.camera.near,
                // far:  this._.camera.far
                // resolution: resolution,
                // sizeAttenuation: true,
            });
            for (let j = 0; j <= curve_length; ++j) {
                const i_curve = j * 3;
                const {x,y,z} = spline.getPoint(j / curve_length);
                lines[i_curve + 0] = x;
                lines[i_curve + 1] = y;
                lines[i_curve + 2] = z;
            }
            let meshLine = new MeshLine();
            meshLine.setGeometry(lines);
            group.add(new THREE.Mesh(meshLine.geometry, material));
        }
        _.track_lines_object = group;
        return _.track_lines_object;
    }

    const vertexshader = `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;

    void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );
        gl_Position = projectionMatrix * mvPosition;
    }`;

    const fragmentshader = `
    uniform vec3 color;
    uniform sampler2D texture;
    uniform float opacity;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4( color * vColor, opacity );
        gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
    }`;

    function loadFlights() {
        const uniforms = {
            color: {
                type: "c",
                value: new THREE.Color(0xaaaaaa)
            },
            texture: {
                type: "t",
                value: _.texture
            },
            opacity: {
                type: "f",
                value: point_opacity
            }
        };
        _.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexshader,
            fragmentShader: fragmentshader,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
        });

        const group = new THREE.Group();
        generateControlPoints(_.SCALE+1);
        group.add(!window.MeshLineMaterial ?
            generate_track_lines.call(this) :
            generate_track_lines2.call(this));
        group.add(generate_point_cloud.call(this));
        group.name = 'flightLineThreejs';
        if (this._.domEvents) {
            this._.domEvents.addEventListener(_.track_lines_object, 'mousemove', function(event){
                for (var v of _.onHoverVals) {
                    v.call(event.target, event);
                }
            }, false);
        }
        _.sphereObject = group;
        _.sphereObject.name = _.me.name;
        _.loaded = true;
    }

    function init() {
        _.SCALE = this._.proj.scale();
        _.texture = this.threejsPlugin.texture(imgUrl);
    }

    function create() {
        if (_.texture && !_.sphereObject && !_.loaded) {
            loadFlights.call(this);
        }
        const tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    function reload() {
        all_tracks = [];
        point_cache = [];
        const tj = this.threejsPlugin;
        loadFlights.call(this);
        const grp = tj.group();
        const arr = grp.children;
        const idx = arr.findIndex(obj=>obj.name==='flightLineThreejs');
        grp.remove(arr[idx]);
        grp.add(_.sphereObject);
        tj.renderThree();
    }

    let start = 0;
    function interval(timestamp) {
        if ((timestamp - start)>30 && !this._.drag) {
            start = timestamp;
            update_point_cloud();
            this.threejsPlugin.renderThree();
        }
    }

    function resize() {
        const ps = this._.proj.scale();
        const sc = _.resize(ps);
        const pt = _.sphereObject.children[1];
        const {size,value} = pt.geometry.attributes;
        size.array = value.array.map((v)=>_.point(v)*sc);
        size.needsUpdate = true;

        if (window.MeshLineMaterial) {
            _.track_lines_object.children.forEach(mesh=>{
                mesh.material.uniforms.lineWidth.value = lineScale(ps);
                mesh.material.needsUpdate = true;
            })
        }
    }

    return {
        name: 'flightLineThreejs',
        urls: jsonUrl && [jsonUrl],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            init.call(this);
            this._.options.showFlightLine = true;
        },
        onResize() {
            resize.call(this);
        },
        onInterval(t) {console.log(1)
            _.lightFlow && interval.call(this, t);
        },
        onCreate() {
            create.call(this);
        },
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(k => _.onHover[k]);
        },
        reload() {
            reload.call(this);
        },
        data(data, colorR, pointR=[50,500], h=150, o=0.8) {
            if (data) {
                _.data = data;
                if (colorR) {
                    if (!Array.isArray(colorR)) {
                        colorR = ['#ff0000','#aaffff'];
                    }
                    const d = d3.extent(data.map(x=>x[4]));
                    colorRange = [d3.rgb(colorR[0]),d3.rgb(colorR[1])];
                    _.color = d3.scaleLinear().domain(d).interpolate(d3.interpolateHcl).range(colorRange);
                    _.point = d3.scaleLinear().domain(d).range(pointR);
                    _.maxVal= d[1];
                } else {
                    _.color = () => 'rgb(255, 255, 255)';
                    _.point = () => 150;
                    _.maxVal= 1;
                }
                height  = h;
                point_opacity = o;
                _.resize= d3.scaleLinear().domain([30,this._.proj.scale()]).range([0.1, 1]);
            } else {
                return _.data;
            }
        },
        sphere() {
            return _.sphereObject;
        },
        pointSize(one) {
            const pt = _.sphereObject.children[1];
            const {size} = pt.geometry.attributes;
            size.array = size.array.map((v)=>v*one);
            size.needsUpdate = true;
        },
        lightFlow(forceState) {
            if (forceState!==undefined) {
                _.lightFlow = forceState;
            } else {
                return _.lightFlow;
            }
        }
    }
}
