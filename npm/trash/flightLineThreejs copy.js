// http://callumprentice.github.io/apps/flight_stream/index.html
export default function (jsonUrl, num_decorators) {
    if ( num_decorators === void 0 ) num_decorators=15;

    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null,
    };

    var vertexshader = "\n        uniform vec2 uvScale;\n        varying vec2 vUv;\n\n        void main() {\n            vUv = uv;\n            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n            gl_Position = projectionMatrix * mvPosition;\n        }";

    var fragmentshader = "\n        uniform float time;\n        uniform vec2 resolution;\n        varying vec2 vUv;\n\n        void main(void) {\n            vec2 position = vUv / resolution.xy;\n            float green = abs(sin(position.x * position.y + time / 5.0)) + 0.5;\n            float red   = abs(sin(position.x * position.y + time / 4.0)) + 0.1;\n            float blue  = abs(sin(position.x * position.y + time / 3.0)) + 0.2;\n            gl_FragColor= vec4(red, green, blue, 1.0);\n        }";

    // get the point in space on surface of sphere radius radius from lat lng
    // lat and lng are in degrees
    function latlngPosFromLatLng(lat, lng, radius) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;
        var x = radius * Math.sin(phi) * Math.cos(theta);
        var y = radius * Math.cos(phi);
        var z = radius * Math.sin(phi) * Math.sin(theta);

        return {
            phi: phi,
            theta: theta,
            x: x,
            y: y,
            z: z
        };
    }

    // convert an angle in degrees to same in radians
    function latlngDeg2rad(n) {
        return n * Math.PI / 180;
    }

    // Find intermediate points on sphere between two lat/lngs
    // lat and lng are in degrees
    // offset goes from 0 (lat/lng1) to 1 (lat/lng2)
    // formula from http://williams.best.vwh.net/avform.htm#Intermediate
    function latlngInterPoint(lat1, lng1, lat2, lng2, offset) {
        lat1 = latlngDeg2rad(lat1);
        lng1 = latlngDeg2rad(lng1);
        lat2 = latlngDeg2rad(lat2);
        lng2 = latlngDeg2rad(lng2);

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

    var uniforms = {
        time: {
            type: "f",
            value: 1.0
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2()
        }
    };

    function addTrack(start_lat, start_lng, end_lat, end_lng, radius, group) {
        var num_control_points = 10;
        var max_altitude = Math.random() * 120;

        var points = [];
        for (var i = 0; i < num_control_points + 1; i++) {
            var arc_angle = i * 180.0 / num_control_points;
            var arc_radius = radius + (Math.sin(latlngDeg2rad(arc_angle))) * max_altitude;
            var latlng = latlngInterPoint(start_lat, start_lng, end_lat, end_lng, i / num_control_points);
            var pos = latlngPosFromLatLng(latlng.lat, latlng.lng, arc_radius);

            points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
        }
        var spline = new THREE.CatmullRomCurve3(points);

        var circleRadius = 0.5;
        var shape = new THREE.Shape();
        shape.moveTo(0, circleRadius);
        shape.quadraticCurveTo( circleRadius,   circleRadius, circleRadius, 0);
        shape.quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius);
        shape.quadraticCurveTo(-circleRadius, - circleRadius, - circleRadius, 0);
        shape.quadraticCurveTo(-circleRadius,   circleRadius, 0, circleRadius);
        var circle_extrude = new THREE.ExtrudeGeometry(shape, {
            bevelEnabled: false,
            extrudePath: spline,
            amount: 10,
            steps: 64,
        });

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexshader,
            fragmentShader: fragmentshader
        });

        uniforms.resolution.value.x = 100;
        uniforms.resolution.value.y = 100;

        var mesh = new THREE.Mesh(circle_extrude, material);
        group.add(mesh);
    }

    function init() {
        this._.options.showFlightLine = true;
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var group = new THREE.Group();
            var SCALE = this._.proj.scale();

            for (var i = 0; i < num_decorators; ++i) {
                var start_index = Math.floor(Math.random() * _.data.length) - 1;
                var start_lat = _.data[start_index].lat;
                var start_lng = _.data[start_index].lng;

                var end_index = Math.floor(Math.random() * _.data.length) - 1;
                var end_lat = _.data[end_index].lat;
                var end_lng = _.data[end_index].lng;
                addTrack(start_lat, start_lng, end_lat, end_lng, SCALE, group);
            }
            _.sphereObject = group;
        }
        tj.addGroup(_.sphereObject);
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
        onCreate: function onCreate() {
            create.call(this);
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
