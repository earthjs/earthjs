// http://callumprentice.github.io/apps/flight_stream/index.html
export default (jsonUrl, num_decorators=15) => {
    /*eslint no-console: 0 */
    const _ = {
        sphereObject: null,
    };

    const vertexshader = `
        uniform vec2 uvScale;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }`;

    const fragmentshader = `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        void main(void) {
            vec2 position = vUv / resolution.xy;
            float green = abs(sin(position.x * position.y + time / 5.0)) + 0.5;
            float red   = abs(sin(position.x * position.y + time / 4.0)) + 0.1;
            float blue  = abs(sin(position.x * position.y + time / 3.0)) + 0.2;
            gl_FragColor= vec4(red, green, blue, 1.0);
        }`;

    // get the point in space on surface of sphere radius radius from lat lng
    // lat and lng are in degrees
    function latlngPosFromLatLng(lat, lng, radius) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (360 - lng) * Math.PI / 180;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

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

    const uniforms = {
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
        const num_control_points = 10;
        const max_altitude = Math.random() * 120;

        const points = [];
        for (let i = 0; i < num_control_points + 1; i++) {
            const arc_angle = i * 180.0 / num_control_points;
            const arc_radius = radius + (Math.sin(latlngDeg2rad(arc_angle))) * max_altitude;
            const latlng = latlngInterPoint(start_lat, start_lng, end_lat, end_lng, i / num_control_points);
            const pos = latlngPosFromLatLng(latlng.lat, latlng.lng, arc_radius);

            points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
        }
        const spline = new THREE.CatmullRomCurve3(points);

        const circleRadius = 0.5;
        const shape = new THREE.Shape();
        shape.moveTo(0, circleRadius);
        shape.quadraticCurveTo( circleRadius,   circleRadius, circleRadius, 0);
        shape.quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius);
        shape.quadraticCurveTo(-circleRadius, - circleRadius, - circleRadius, 0);
        shape.quadraticCurveTo(-circleRadius,   circleRadius, 0, circleRadius);
        const circle_extrude = new THREE.ExtrudeGeometry(shape, {
            bevelEnabled: false,
            extrudePath: spline,
            amount: 10,
            steps: 64,
        });

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexshader,
            fragmentShader: fragmentshader
        });

        uniforms.resolution.value.x = 100;
        uniforms.resolution.value.y = 100;

        const mesh = new THREE.Mesh(circle_extrude, material);
        group.add(mesh);
    }

    function init() {
        this._.options.showFlightLine = true;
    }

    function create() {
        const o = this._.options;
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const group = new THREE.Group();
            const SCALE = this._.proj.scale();

            for (let i = 0; i < num_decorators; ++i) {
                const start_index = Math.floor(Math.random() * _.data.length) - 1;
                const start_lat = _.data[start_index].lat;
                const start_lng = _.data[start_index].lng;

                const end_index = Math.floor(Math.random() * _.data.length) - 1;
                const end_lat = _.data[end_index].lat;
                const end_lng = _.data[end_index].lng;
                addTrack(start_lat, start_lng, end_lat, end_lng, SCALE, group);
            }
            _.sphereObject = group;
            console.log('done add');
        }
        _.sphereObject.visible = o.showFlightLine;
        tj.addGroup(_.sphereObject);
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
