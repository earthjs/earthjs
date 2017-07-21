// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
export default () => {
    /*eslint no-console: 0 */
    const _ = {radius: null};
    _.scale = d3.scaleLinear().domain([0,200]).range([0,1]);

    // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
    // Axes have been rotated so Three's "y" axis is parallel to the North Pole
    function vertex(point) {
        var lambda = point[0] * Math.PI / 180,
            phi = point[1] * Math.PI / 180,
            cosPhi = Math.cos(phi);
        return new THREE.Vector3(
            _.radius * cosPhi * Math.cos(lambda),
            _.radius * Math.sin(phi),
          - _.radius * cosPhi * Math.sin(lambda)
      );
    }

    // Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
    function wireframe(multilinestring, material) {
        var geometry = new THREE.Geometry;
        multilinestring.coordinates.forEach(function(line) {
            d3.pairs(line.map(vertex), function(a, b) {
                geometry.vertices.push(a, b);
            });
        });
        return new THREE.LineSegments(geometry, material);
    }

    // See https://github.com/d3/d3-geo/issues/95
    function graticule10() {
        var epsilon = 1e-6,
            x1 = 180, x0 = -x1, y1 = 80, y0 = -y1, dx = 10, dy = 10,
            X1 = 180, X0 = -X1, Y1 = 90, Y0 = -Y1, DX = 90, DY = 360,
            x = graticuleX(y0, y1, 2.5), y = graticuleY(x0, x1, 2.5),
            X = graticuleX(Y0, Y1, 2.5), Y = graticuleY(X0, X1, 2.5);

        function graticuleX(y0, y1, dy) {
            var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
            return function(x) { return y.map(function(y) { return [x, y]; }); };
        }

        function graticuleY(x0, x1, dx) {
            var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
            return function(y) { return x.map(function(x) { return [x, y]; }); };
        }

        return {
            type: "MultiLineString",
            coordinates: d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X)
                .concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
                .concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return Math.abs(x % DX) > epsilon; }).map(x))
                .concat(d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function(y) { return Math.abs(y % DY) > epsilon; }).map(y))
        };
    }

    function init() {
        const __ = this._;
        __.options.showGraticule = true;
        _.radius = this._.proj.scale();
        _.graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0xaaaaaa})); //0x800000
        this.threejsPlugin.addObject(_.graticule);
        refresh.call(this);
    }

    function refresh() {
        const __ = this._;
        const rt = __.proj.rotate();
        rt[0]   -= 90;
        const q1 = __.versor(rt);
        const q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        _.graticule.setRotationFromQuaternion(q2);
    }

    function resize() {
        const sc = _.scale(this._.proj.scale());
        const se = _.graticule;
        se.scale.x = sc;
        se.scale.y = sc;
        se.scale.z = sc;
    }

    return {
        name: 'graticuleThreejs',
        onInit() {
            init.call(this);
        },
        onRefresh() {
            if (_.graticule) {
                refresh.call(this);
            }
        },
        onResize() {
            resize.call(this);
        },
    }
}
