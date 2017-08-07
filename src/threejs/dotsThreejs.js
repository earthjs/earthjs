// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
export default urlJson => {
    /*eslint no-console: 0 */
    const _ = {dataDots: null};

    function init() {
        this._.options.showDots = true;
    }

    function createDot(feature) {
        if (feature) {
            const tj = this.threejsPlugin;
            // var dc = [-77.0369, 38.9072];
            // var position = tj.vertex(feature ? feature.geometry.coordinates : dc);
            var position = tj.vertex(feature.geometry.coordinates);
            var material = new THREE.SpriteMaterial({ color: 0x0000ff });
            var dot = new THREE.Sprite(material);
            dot.position.set(position.x, position.y, position.z);
            return dot;
        }
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.dots) {
            create1.call(this);
        }
        _.dots.visible = this._.options.showDots;
        tj.addGroup(_.dots);
    }

    function create1() {
        const _this = this;
        _.dots = new THREE.Group();
        _.dataDots.features.forEach(function(d) {
            const dot = createDot.call(_this, d);
            dot && _.dots.add(dot);
        });
    }

    // function create2() {
    // }

    return {
        name: 'dotsThreejs',
        urls: urlJson && [urlJson],
        onReady(err, data) {
            this.dotsThreejs.data(data);
        },
        onInit() {
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.dots.visible = this._.options.showDots;
        },
        data(data) {
            if (data) {
                _.dataDots = data;
            } else {
                return _.dataDots;
            }
        }
    }
}
