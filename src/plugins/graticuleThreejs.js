// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
export default () => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: null};

    function init() {
        this._.options.showGraticule = true;
        _.graticule10 = graticule10();
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

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            const material = new THREE.LineBasicMaterial({color: 0xaaaaaa});
            _.sphereObject = tj.wireframe(_.graticule10, material); //0x800000
            _.sphereObject.visible = this._.options.showGraticule;
        }
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'graticuleThreejs',
        onInit() {
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showGraticule;
        }
    }
}
