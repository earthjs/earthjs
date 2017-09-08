// http://callumprentice.github.io/apps/flight_stream/index.html
export default function (jsonUrl) {
    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null,
        end_flight_idx: 0,
        start_flight_idx: 0,
        flight_distance: [],
        flight_path_splines: [],
        flight_point_end_time: [],
        flight_point_start_time: [],
        flight_point_speed_scaling: 5.0,
        flight_point_speed_min_scaling: 1.0,
        flight_point_speed_max_scaling: 25.0,
        flight_track_opacity: 0.05,
    };

    // const vertexshader = `
    //     attribute float size;
    //     attribute vec3 customColor;
    //
    //     varying vec3 vColor;
    //
    //     void main() {
    //         vColor = customColor;
    //         vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    //         gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );
    //         gl_Position = projectionMatrix * mvPosition;
    //     }`;
    //
    // const fragmentshader = `
    //     uniform vec3 color;
    //     uniform sampler2D texture;
    //
    //     varying vec3 vColor;
    //
    //     void main() {
    //         gl_FragColor = vec4( color * vColor, 0.5 );
    //         gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
    //     }`;

    function generateControlPoints(radius) {
        for (var f = _.start_flight_idx; f < _.end_flight_idx; ++f) {

            var start_lat = _.data[f][0];
            var start_lng = _.data[f][1];
            var end_lat   = _.data[f][2];
            var end_lng   = _.data[f][3];

            var max_height = Math.random() * 0.4;

            var points = [];
            var spline_control_points = 8;
            for (var i = 0; i < spline_control_points + 1; i++) {
                var arc_angle = i * 180.0 / spline_control_points;
                var arc_radius = radius + (Math.sin(arc_angle * Math.PI / 180.0)) * max_height;
                var latlng = latlngInterPoint(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);

                var pos = xyzFromLatLng(latlng.lat, latlng.lng, arc_radius);

                points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
            }

            var spline = new THREE.CatmullRomCurve3(points);

            _.flight_path_splines.push(spline);

            var arc_length = spline.getLength();
            _.flight_distance.push(arc_length);

            setFlightTimes(f);
        }
    }

    function setFlightTimes(index) {
        var scaling_factor = (_.flight_point_speed_scaling - _.flight_point_speed_min_scaling) /
                                (_.flight_point_speed_max_scaling - _.flight_point_speed_min_scaling);
        var duration = (1-scaling_factor) * _.flight_distance[index] * 80000;

        var start_time = Date.now() + Math.random() * 5000
        _.flight_point_start_time[index] = start_time;
        _.flight_point_end_time[index] = start_time + duration;
    }

    function xyzFromLatLng(lat, lng, radius) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;

        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    }

    function latlngInterPoint(lat1, lng1, lat2, lng2, offset) {
        lat1 = lat1 * Math.PI / 180.0;
        lng1 = lng1 * Math.PI / 180.0;
        lat2 = lat2 * Math.PI / 180.0;
        lng2 = lng2 * Math.PI / 180.0;

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

    function flightPathLines() {

        var num_control_points = 32;

        var geometry = new THREE.BufferGeometry();
        var material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
            opacity: _.flight_track_opacity,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            linewidth: 0.001
        });
        var line_positions = new Float32Array(_.data.length * 3 * 2 * num_control_points);
        var colors = new Float32Array(_.data.length * 3 * 2 * num_control_points);

        for (var i = _.start_flight_idx; i < _.end_flight_idx; ++i) {

            for (var j = 0; j < num_control_points - 1; ++j) {

                var start_pos = _.flight_path_splines[i].getPoint(j / (num_control_points - 1));
                var end_pos = _.flight_path_splines[i].getPoint((j + 1) / (num_control_points - 1));

                line_positions[(i * num_control_points + j) * 6 + 0] = start_pos.x;
                line_positions[(i * num_control_points + j) * 6 + 1] = start_pos.y;
                line_positions[(i * num_control_points + j) * 6 + 2] = start_pos.z;
                line_positions[(i * num_control_points + j) * 6 + 3] = end_pos.x;
                line_positions[(i * num_control_points + j) * 6 + 4] = end_pos.y;
                line_positions[(i * num_control_points + j) * 6 + 5] = end_pos.z;

                colors[(i * num_control_points + j) * 6 + 0] = 1.0;
                colors[(i * num_control_points + j) * 6 + 1] = 0.4;
                colors[(i * num_control_points + j) * 6 + 2] = 1.0;
                colors[(i * num_control_points + j) * 6 + 3] = 1.0;
                colors[(i * num_control_points + j) * 6 + 4] = 0.4;
                colors[(i * num_control_points + j) * 6 + 5] = 1.0;
            }
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(line_positions, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

        geometry.computeBoundingSphere();

        return new THREE.LineSegments( geometry, material );
    }

    // function flightPointCloud() {
    //     var flight_point_cloud_geom = new THREE.BufferGeometry();
    //
    //     var num_points = _.data.length;
    //
    //     var positions = new Float32Array(num_points * 3);
    //     var colors = new Float32Array(num_points * 3);
    //     var sizes = new Float32Array(num_points);
    //
    //     for (var i = 0; i < num_points; i++) {
    //         positions[3 * i + 0] = 0;
    //         positions[3 * i + 1] = 0;
    //         positions[3 * i + 2] = 0;
    //
    //         colors[3 * i + 0] = Math.random();
    //         colors[3 * i + 1] = Math.random();
    //         colors[3 * i + 2] = Math.random();
    //
    //         sizes[i] = 0.03;
    //     }
    //
    //     flight_point_cloud_geom.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    //     flight_point_cloud_geom.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    //     flight_point_cloud_geom.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
    //     flight_point_cloud_geom.computeBoundingBox();
    //
    //     var attributes = {
    //         size: {
    //             type: 'f',
    //             value: null
    //         },
    //         customColor: {
    //             type: 'c',
    //             value: null
    //         }
    //     };
    //
    //     var uniforms = {
    //         color: {
    //             type: "c",
    //             value: new THREE.Color(0xffffff)
    //         },
    //         texture: {
    //             type: "t",
    //             value: THREE.ImageUtils.loadTexture("images/point.png")
    //         }
    //     };
    //
    //     var shaderMaterial = new THREE.ShaderMaterial({
    //         uniforms: uniforms,
    //         attributes: attributes,
    //         vertexShader: vertexshader,
    //         fragmentShader: fragmentshader,
    //         blending: THREE.AdditiveBlending,
    //         depthTest: true,
    //         depthWrite: false,
    //         transparent: true
    //     });
    //
    //     return new THREE.Points(flight_point_cloud_geom, shaderMaterial);
    // }

    function init() {
        this._.options.showFlightLine = true;
    }

    function create() {
        var o = this._.options;
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var group = new THREE.Group();
            var SCALE = this._.proj.scale();
            generateControlPoints(SCALE);
            group.add(flightPathLines());
            // group.add(flightPointCloud());
            _.sphereObject = group;
        }
        _.sphereObject.visible = o.showFlightLine;
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'flightLineThreejs',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            _.end_flight_idx = data.length;
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showFlightLine;
        },
        data: function data(data$1) {
            if (data$1) {
                _.data = data$1;
            } else {
                return _.data;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
