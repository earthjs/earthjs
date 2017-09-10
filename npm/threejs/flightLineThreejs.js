// http://callumprentice.github.io/apps/flight_stream/index.html
// https://stackoverflow.com/questions/9695687/javascript-converting-colors-numbers-strings-vice-versa
export default function (jsonUrl, imgUrl, height) {
    if ( height === void 0 ) height=150;

    /*eslint no-console: 0 */
    var _ = {
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
    var lineScale = d3.scaleLinear().domain([30,2500]).range([0.001, 0.02]);
    var PI180 = Math.PI / 180.0;

    var colorRange = [d3.rgb('#ff0000'),d3.rgb("#aaffff")];
    var min_arc_distance = +Infinity;
    var max_arc_distance = -Infinity;
    var cur_arc_distance = 0;
    var point_spacing = 100;
    var point_opacity = 0.8;
    var point_speed = 1.0;
    var point_cache = [];
    var all_tracks = [];

    var ttl_num_points = 0;
    function generateControlPoints(radius) {
        for (var f = 0; f < _.data.length; ++f) {
            var start_lat = _.data[f][0];
            var start_lng = _.data[f][1];
            var end_lat   = _.data[f][2];
            var end_lng   = _.data[f][3];
            var value     = _.data[f][4];

            if (start_lat === end_lat && start_lng === end_lng) {
                continue;
            }

            var points = [];
            var spline_control_points = 8;
            var max_height = Math.random() * height + 0.05;
            for (var i = 0; i < spline_control_points + 1; i++) {
                var arc_angle = i * 180.0 / spline_control_points;
                var arc_radius = radius + (Math.sin(arc_angle * PI180)) * max_height;
                var latlng = lat_lng_inter_point(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);
                var pos = xyz_from_lat_lng(latlng.lat, latlng.lng, arc_radius);

                points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
            }

            var point_positions = [];
            var spline = new THREE.CatmullRomCurve3(points);
            var arc_distance = lat_lng_distance(start_lat, start_lng, end_lat, end_lng, radius);
            for (var t = 0; t < arc_distance; t += point_spacing) {
                var offset = t / arc_distance;
                point_positions.push(spline.getPoint(offset));
            }

            var arc_distance_miles = (arc_distance / (2 * Math.PI)) * 24901;
            if (arc_distance_miles < min_arc_distance) {
                min_arc_distance = arc_distance_miles;
            }

            if (arc_distance_miles > max_arc_distance) {
                max_arc_distance = parseInt(Math.ceil(arc_distance_miles / 1000.0) * 1000);
                cur_arc_distance = max_arc_distance;
            }
            var color = value ? _.color(value) : 'rgb(255,255,255)';
            var default_speed = Math.random()*600+400;
            var speed = default_speed * point_speed;
            var num_points = parseInt(arc_distance / point_spacing) + 1;
            var spd_points = speed * num_points;
            ttl_num_points += num_points;

            all_tracks.push({
                spline: spline,
                num_points: num_points,
                spd_points: spd_points,
                arc_distance: arc_distance,
                arc_distance_miles: arc_distance_miles,
                point_positions: point_positions,
                default_speed: default_speed,
                value: value,
                color: color,
                speed: speed
            });
        }
    }

    function xyz_from_lat_lng(lat, lng, radius) {
        var phi = (90 - lat) * PI180;
        var theta = (360 - lng) * PI180;
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    }

    function lat_lng_distance(lat1, lng1, lat2, lng2, radius) {
        var a = Math.sin(((lat2 - lat1) * PI180) / 2) *
            Math.sin(((lat2 - lat1) * PI180) / 2) +
            Math.cos(lat1 * PI180) *
            Math.cos(lat2 * PI180) *
            Math.sin(((lng2 - lng1) * PI180) / 2) *
            Math.sin(((lng2 - lng1) * PI180) / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
    }

    function lat_lng_inter_point(lat1, lng1, lat2, lng2, offset) {
        lat1 = lat1 * PI180;
        lng1 = lng1 * PI180;
        lat2 = lat2 * PI180;
        lng2 = lng2 * PI180;

        var d = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin((lat1 - lat2) / 2)), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));
        var A = Math.sin((1 - offset) * d) / Math.sin(d);
        var B = Math.sin(offset * d) / Math.sin(d);
        var x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
        var y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
        var z = A * Math.sin(lat1) + B * Math.sin(lat2);
        var lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
        var lng = Math.atan2(y, x) * 180 / Math.PI;

        return {
            lat: lat,
            lng: lng
        };
    }

    var positions;
    function generate_point_cloud() {
        positions = new Float32Array(ttl_num_points * 3);
        var colors = new Float32Array(ttl_num_points * 3);
        var values = new Float32Array(ttl_num_points);
        var sizes = new Float32Array(ttl_num_points);

        var index = 0;
        for (var i = 0; i < all_tracks.length; ++i) {
            var ref = all_tracks[i];
            var value = ref.value;
            var color = ref.color;
            var point_positions = ref.point_positions;
            var ref$1 = new THREE.Color(color);
            var r = ref$1.r;
            var g = ref$1.g;
            var b = ref$1.b; //.setHSL(1-value/_.maxVal, 0.4, 0.8);
            var pSize = _.point(value || 1);
            for (var j = 0; j < point_positions.length; ++j) {

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

        var point_cloud_geom = new THREE.BufferGeometry();
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
        var i_length = all_tracks.length;
        var dates = Date.now();
        var index = 0;
        for (var i= 0; i < i_length; ++i) {
            var ref = all_tracks[i];
            var speed = ref.speed;
            var spline = ref.spline;
            var num_points = ref.num_points;
            var spd_points = ref.spd_points;
            var arc_distance = ref.arc_distance;
            var arc_distance_miles = ref.arc_distance_miles;

            if (arc_distance_miles <= cur_arc_distance) {
                var normalized = point_spacing / arc_distance;
                var time_scale = (dates % speed) / spd_points;
                for (var j = 0; j < num_points; j++) {
                    var  t = j * normalized + time_scale;
                    var ref$1= fast_get_spline_point(i, t, spline);
                    var x = ref$1.x;
                    var y = ref$1.y;
                    var z = ref$1.z;
                    var index3 = 3 * index;
                    positions[index3 + 0] = x;
                    positions[index3 + 1] = y;
                    positions[index3 + 2] = z;
                    index++;
                }
            } else {
                for (var j$1 = 0; j$1 < num_points; j$1++) {
                    var index3$1 = 3 * index;
                    positions[index3$1 + 0] = Infinity;
                    positions[index3$1 + 1] = Infinity;
                    positions[index3$1 + 2] = Infinity;
                    index++;
                }

            }
        }
        _.attr_position.needsUpdate = true;
    }

    function fast_get_spline_point(i, t, spline) {
        // point_cache set in generate_point_cloud()
        var pcache = point_cache[i];
        var tc = parseInt(t * 1000);
        if (pcache[tc] === undefined) {
            pcache[tc] = spline.getPoint(t);
        }
        return pcache[tc];
    }

    var line_opacity = 0.4;
    var curve_points =  24;
    var curve_length =  curve_points - 1;
    var material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        opacity: line_opacity,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        color: 0xffffff,
        linewidth: _.linewidth
    });
    function generate_track_lines() {
        var length = all_tracks.length;
        var total_arr = length * 6 * curve_points;
        var geometry  = new THREE.BufferGeometry();
        var colors    = new Float32Array(total_arr);
        var line_positions = new Float32Array(total_arr);

        for (var i = 0; i < length; ++i) {
            var l = i * curve_points;
            var ref = all_tracks[i];
            var spline = ref.spline;
            var color = ref.color;
            var ref$1 = new THREE.Color(color);
            var r = ref$1.r;
            var g = ref$1.g;
            var b = ref$1.b;
            for (var j = 0; j < curve_length; ++j) {
                var k = j+1;
                var c1 = spline.getPoint(j / curve_length);
                var c2 = spline.getPoint(k / curve_length);
                line_positions[i_curve + 0] = c1.x;
                line_positions[i_curve + 1] = c1.y;
                line_positions[i_curve + 2] = c1.z;
                line_positions[i_curve + 3] = c2.x;
                line_positions[i_curve + 4] = c2.y;
                line_positions[i_curve + 5] = c2.z;

                var i_curve = (j + l) * 6;
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
        var length = all_tracks.length;
        var group = new THREE.Group();
        var lineWidth = lineScale(this._.proj.scale());
        for (var i = 0; i < length; ++i) {
            var ref = all_tracks[i];
            var spline = ref.spline;
            var color = ref.color;
            var lines = new Float32Array(3 * curve_points);
            var material = new MeshLineMaterial({
                color: new THREE.Color(color),
                useMap: false,
                opacity: 1,
                lineWidth: lineWidth,
                // near: this._.camera.near,
                // far:  this._.camera.far
                // resolution: resolution,
                // sizeAttenuation: true,
            });
            for (var j = 0; j < curve_length; ++j) {
                var i_curve = j * 3;
                var ref$1 = spline.getPoint(j / curve_length);
                var x = ref$1.x;
                var y = ref$1.y;
                var z = ref$1.z;
                lines[i_curve + 0] = x;
                lines[i_curve + 1] = y;
                lines[i_curve + 2] = z;
            }
            var meshLine = new MeshLine();
            meshLine.setGeometry(lines);
            group.add(new THREE.Mesh(meshLine.geometry, material));
        }
        _.track_lines_object = group;
        return _.track_lines_object;
    }

    var vertexshader = "\n    attribute float size;\n    attribute vec3 customColor;\n    varying vec3 vColor;\n\n    void main() {\n        vColor = customColor;\n        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n        gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );\n        gl_Position = projectionMatrix * mvPosition;\n    }";

    var fragmentshader = "\n    uniform vec3 color;\n    uniform sampler2D texture;\n    uniform float opacity;\n\n    varying vec3 vColor;\n\n    void main() {\n        gl_FragColor = vec4( color * vColor, opacity );\n        gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );\n    }";

    function loadFlights() {
        var uniforms = {
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

        var group = new THREE.Group();
        generateControlPoints(_.SCALE+1);
        group.add(!window.MeshLineMaterial ?
            generate_track_lines.call(this) :
            generate_track_lines2.call(this));
        group.add(generate_point_cloud.call(this));
        group.name = 'flightLineThreejs';
        if (this._.domEvents) {
            this._.domEvents.addEventListener(_.track_lines_object, 'mousemove', function(event){
                for (var i = 0, list = _.onHoverVals; i < list.length; i += 1) {
                    var v = list[i];

                    v.call(event.target, event);
                }
            }, false);
        }
        _.sphereObject = group;
        _.loaded = true;
    }

    function init() {
        _.SCALE = this._.proj.scale();
        var manager = new THREE.LoadingManager();
        var loader = new THREE.TextureLoader(manager);
        this._.options.showFlightLine = true;
        _.texture = loader.load(imgUrl,
            function(point_texture) {
                return point_texture;
            })
    }

    function create() {
        if (_.texture && !_.sphereObject && !_.loaded) {
            loadFlights.call(this);
        }
        var tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    function reload() {
        all_tracks = [];
        point_cache = [];
        var tj = this.threejsPlugin;
        loadFlights.call(this);
        var grp = tj.group();
        var arr = grp.children;
        var idx = arr.findIndex(function (obj){ return obj.name==='flightLineThreejs'; });
        grp.remove(arr[idx]);
        grp.add(_.sphereObject);
        tj.renderThree();
    }

    var start = 0;
    function interval(timestamp) {
        if ((timestamp - start)>30 && !this._.drag) {
            start = timestamp;
            update_point_cloud();
            this.threejsPlugin.renderThree();
        }
    }

    function resize() {
        var ps = this._.proj.scale();
        var sc = _.resize(ps);
        var pt = _.sphereObject.children[1];
        var ref = pt.geometry.attributes;
        var size = ref.size;
        var value = ref.value;
        size.array = value.array.map(function (v){ return _.point(v)*sc; });
        size.needsUpdate = true;

        if (window.MeshLineMaterial) {
            _.track_lines_object.children.forEach(function (mesh){
                mesh.material.uniforms.lineWidth.value = lineScale(ps);
                mesh.material.needsUpdate = true;
            })
        }
    }

    return {
        name: 'flightLineThreejs',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onInterval: function onInterval(t) {
            _.lightFlow && interval.call(this, t);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) { return _.onHover[k]; });
        },
        reload: function reload$1() {
            reload.call(this);
        },
        data: function data(data$1, colorR, pointR, h, o) {
            if ( pointR === void 0 ) pointR=[50,500];
            if ( h === void 0 ) h=150;
            if ( o === void 0 ) o=0.8;

            if (data$1) {
                _.data = data$1;
                if (colorR) {
                    if (!Array.isArray(colorR)) {
                        colorR = ['#ff0000','#aaffff'];
                    }
                    var d = d3.extent(data$1.map(function (x){ return x[4]; }));
                    colorRange = [d3.rgb(colorR[0]),d3.rgb(colorR[1])];
                    _.color = d3.scaleLinear().domain(d).interpolate(d3.interpolateHcl).range(colorRange);
                    _.point = d3.scaleLinear().domain(d).range(pointR);
                    _.maxVal= d[1];
                } else {
                    _.color = function () { return 'rgb(255, 255, 255)'; };
                    _.point = function () { return 150; };
                    _.maxVal= 1;
                }
                height  = h;
                point_opacity = o;
                _.resize= d3.scaleLinear().domain([30,this._.proj.scale()]).range([0.1, 1]);
            } else {
                return _.data;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
        pointSize: function pointSize(one) {
            var pt = _.sphereObject.children[1];
            var ref = pt.geometry.attributes;
            var size = ref.size;
            size.array = size.array.map(function (v){ return v*one; });
            size.needsUpdate = true;
        },
        lightFlow: function lightFlow(forceState) {
            if (forceState!==undefined) {
                _.lightFlow = forceState;
            } else {
                return _.lightFlow;
            }
        }
    }
}
