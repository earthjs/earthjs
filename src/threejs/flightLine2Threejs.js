// http://callumprentice.github.io/apps/flight_stream/index.html
export default (jsonUrl, imgUrl) => {
    /*eslint no-console: 0 */
    const _ = {
        sphereObject: null,
        track_lines_object: null,
        track_points_object: null,
        texture: null
    };

    var min_arc_distance = +Infinity;
    var max_arc_distance = -Infinity;
    var cur_arc_distance = 0;
    var point_spacing = 100;
    var point_opacity = 0.5;
    var point_speed = 1.0;
    var point_size  = 40;
    var point_cache = [];
    var all_tracks = [];

    var PI180 = Math.PI / 180.0;

    let positions, colors, sizes, ttl_num_points = 0;
    function generateControlPoints(radius) {

        for (var f = 0; f < _.data.length; ++f) {
            var start_lat = _.data[f][0];
            var start_lng = _.data[f][1];
            var end_lat   = _.data[f][2];
            var end_lng   = _.data[f][3];

            if (start_lat === end_lat && start_lng === end_lng) {
                continue;
            }

            var points = [];
            var spline_control_points = 8;
            var max_height = Math.random() * _.SCALE  + 0.05;
            for (var i = 0; i < spline_control_points + 1; i++) {
                var arc_angle = i * 180.0 / spline_control_points;
                var arc_radius = radius + (Math.sin(arc_angle * PI180)) * max_height;  //PI180 = PI180.0
                var latlng = lat_lng_inter_point(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);
                var pos = xyz_from_lat_lng(latlng.lat, latlng.lng, arc_radius);

                points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
            }

            var spline = new THREE.CatmullRomCurve3(points);
            var arc_distance = lat_lng_distance(start_lat, start_lng, end_lat, end_lng, radius);

            var point_positions = [];
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

            var default_speed = Math.random()*600+400;
            var speed = default_speed * point_speed;
            var num_points = parseInt(arc_distance / point_spacing) + 1;
            ttl_num_points += num_points;

            var track = {
                spline,
                num_points,
                arc_distance,
                arc_distance_miles,
                point_positions,
                default_speed,
                speed
            };
            all_tracks.push(track);
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

    var vertexshader = `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;

    void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );
        gl_Position = projectionMatrix * mvPosition;
    }`;

    var fragmentshader = `
    uniform vec3 color;
    uniform sampler2D texture;
    uniform float opacity;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4( color * vColor, opacity );
        gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
    }`;

    function generate_point_cloud() {
        positions = new Float32Array(ttl_num_points * 3);
        colors = new Float32Array(ttl_num_points * 3);
        sizes = new Float32Array(ttl_num_points);

        var index = 0;
        for (var i = 0; i < all_tracks.length; ++i) {
            var color = new THREE.Color(0xffffff).setHSL(i / all_tracks.length, 0.6, 0.6);

            for (var j = 0; j < all_tracks[i].point_positions.length; ++j) {

                positions[3 * index + 0] = 0;
                positions[3 * index + 1] = 0;
                positions[3 * index + 2] = 0;

                colors[3 * index + 0] = color.r;
                colors[3 * index + 1] = color.g;
                colors[3 * index + 2] = color.b;

                sizes[index] = point_size;

                ++index;
            }
        }

        var point_cloud_geom = new THREE.BufferGeometry();
        point_cloud_geom.addAttribute('position',    new THREE.BufferAttribute(positions, 3));
        point_cloud_geom.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        point_cloud_geom.addAttribute('size',        new THREE.BufferAttribute(sizes, 1));
        point_cloud_geom.computeBoundingBox();

        _.track_points_object = new THREE.Points(point_cloud_geom, _.shaderMaterial);
        return _.track_points_object;
    }

    function update_point_cloud() {
        var index = 0;
        var i_length = all_tracks.length;
        for (var i = 0; i < i_length; ++i) {
            var {
                speed,
                spline,
                num_points,
                arc_distance,
                arc_distance_miles
            } = all_tracks[i];

            if (arc_distance_miles <= cur_arc_distance) {
                var normalized = point_spacing / arc_distance;
                var time_scale = (Date.now() % speed) / (speed * num_points);
                for (var j = 0; j < num_points; j++) {
                    var  t = j * normalized + time_scale;
                    var {x,y,z}= fast_get_spline_point(i, t, spline);
                    var index3 = 3 * index;
                    positions[index3 + 0] = x;
                    positions[index3 + 1] = y;
                    positions[index3 + 2] = z;
                    index++;
                }
            } else {
                for (var j = 0; j < num_points; j++) {
                    var index3 = 3 * index;
                    positions[index3 + 0] = Infinity;
                    positions[index3 + 1] = Infinity;
                    positions[index3 + 2] = Infinity;
                    index++;
                }

            }
        }
        _.track_points_object.geometry.attributes.position.needsUpdate = true;
    }

    function fast_get_spline_point(i, t, spline) {
        var tc = parseInt(t * 1000);
        if (point_cache[i] === undefined) {
            point_cache[i] = [];
        }

        var pcache = point_cache[i];
        if (pcache[tc] !== undefined) {
            return pcache[tc];
        }

        var pos = spline.getPoint(t);
        pcache[tc] = pos;
        return pos;
    }

    var line_positions;
    var line_opacity = 0.2;
    var curve_points =  24;
    var material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        opacity: line_opacity,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        color: 0xffffff,
        linewidth: 0.2
    });
    function generate_track_lines() {
        var geometry = new THREE.BufferGeometry();
        var total_arr = all_tracks.length * 3 * 2 * curve_points;
        line_positions= new Float32Array(total_arr);
        var colors    = new Float32Array(total_arr);

        for (var i = 0; i < all_tracks.length; ++i) {
            var {spline} = all_tracks[i];
            var {r,g,b} = new THREE.Color(0xffffff).setHSL(i / all_tracks.length, 0.9, 0.8);
            for (var j = 0; j < curve_points - 1; ++j) {
                /*eslint no-redeclare:0*/
                var i_curve = (i * curve_points + j) * 6;
                var {x,y,z} = spline.getPoint(j / (curve_points - 1));
                line_positions[i_curve + 0] = x;
                line_positions[i_curve + 1] = y;
                line_positions[i_curve + 2] = z;

                var {x,y,z} = spline.getPoint((j + 1) / (curve_points - 1));
                line_positions[i_curve + 3] = x;
                line_positions[i_curve + 4] = y;
                line_positions[i_curve + 5] = z;

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

    // function update_track_lines() {
    //
    //     for (var i = 0; i < all_tracks.length; ++i) {
    //         var {
    //             spline,
    //             arc_distance_miles
    //         } = all_tracks[i];
    //         for (var j = 0; j < curve_points - 1; ++j) {
    //             /*eslint no-redeclare:0*/
    //             var i_curve = (i * curve_points + j) * 6;
    //             if (arc_distance_miles <= cur_arc_distance) {
    //                 var {x,y,z} = spline.getPoint(j / (curve_points - 1));
    //                 line_positions[i_curve + 0] = x;
    //                 line_positions[i_curve + 1] = y;
    //                 line_positions[i_curve + 2] = z;
    //
    //                 var {x,y,z} = spline.getPoint((j + 1) / (curve_points - 1));
    //                 line_positions[i_curve + 3] = x;
    //                 line_positions[i_curve + 4] = y;
    //                 line_positions[i_curve + 5] = z;
    //             } else {
    //                 line_positions[i_curve + 0] = 0.0;
    //                 line_positions[i_curve + 1] = 0.0;
    //                 line_positions[i_curve + 2] = 0.0;
    //                 line_positions[i_curve + 3] = 0.0;
    //                 line_positions[i_curve + 4] = 0.0;
    //                 line_positions[i_curve + 5] = 0.0;
    //             }
    //         }
    //     }
    //
    //     _.track_lines_object.geometry.attributes.position.needsUpdate = true;
    // }

    function loadFlights() {
        const uniforms = {
            color: {
                type: "c",
                value: new THREE.Color(0x00ff00)
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
        generateControlPoints(_.SCALE+5);
        group.add(generate_track_lines());
        group.add(generate_point_cloud());
        _.sphereObject = group;
        _.loaded = true;

        const tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    function init() {
        _.SCALE = this._.proj.scale();
        const manager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader(manager);
        this._.options.showFlightLine = true;
        // const loader = new THREE.TextureLoader();
        // loader.load(imgUrl, texture => {
        //     _.texture = texture
        //     if (_.data && !_.loaded) {
        //         console.log('done add:1');
        //         loadFlights.call(this);
        //     }
        // });
        _.texture = loader.load(imgUrl,
            function(point_texture) {
                return point_texture;
            })
    }

    function create() {
        const o = this._.options;
        if (_.texture && !_.sphereObject && !_.loaded) {
            console.log('done add:2');
            loadFlights.call(this);
        } else if (_.sphereObject) {
            _.sphereObject.visible = o.showFlightLine;
            const tj = this.threejsPlugin;
            tj.addGroup(_.sphereObject);
            tj.rotate();
        }
    }

    var start = 0;
    function interval(timestamp) {
        if ((timestamp - start) > 100) {
            start = timestamp;
            update_point_cloud();
            // update_track_lines();
        }
    }

    return {
        name: 'flightLine2Threejs',
        urls: jsonUrl && [jsonUrl],
        onReady(err, data) {
            this.flightLine2Threejs.data(data);
        },
        onInit() {
            init.call(this);
        },
        onInterval(t) {
            interval.call(this, t);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showFlightLine;
        },
        data(data) {
            if (data) {
                _.data = data;
            } else {
                return _.data;
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
