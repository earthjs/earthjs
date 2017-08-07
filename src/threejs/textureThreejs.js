// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
// http://bl.ocks.org/MAKIO135/eab7b74e85ed2be48eeb
export default () => {
    /*eslint no-console: 0 */
    const _ = {}, datumGraticule = d3.geoGraticule()();
    var material = new THREE.MeshBasicMaterial();
    var geometry;

    function init() {
        const __ = this._;
        const SCALE  = __.proj.scale();
        const width  = __.options.width;
        const height = __.options.height;
        this._.options.showDrawing = true;
        geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        const canvas = d3.select('body').append('canvas');
        canvas.attr('height', height).attr('width', width);
        _.canvas = canvas.node();
        _.context = _.canvas.getContext("2d");
        _.texture = new THREE.Texture(_.canvas);
        _.canvas.width = _.canvas.height = 512;
        _.texture.needsUpdate = true;
        material.map = _.texture;

        var projection = d3.geoMercator().scale(width/2/Math.PI)
            .translate([width/2, height/2]).precision(0.5);

        _.path = d3.geoPath(projection, _.context);
    }

    function create() {
        const __ = this._;
        const tj = this.threejsPlugin;
        var width  = __.options.width;
        var height = __.options.height;
        if (!_.sphereObject) {
            _.context.fillStyle = 'white';
            _.context.fillRect(0, 0, width, height);
            _.context.beginPath();
            _.path(datumGraticule);
            _.context.lineWidth = 0.4;
            _.context.strokeStyle = 'rgba(119,119,119,0.6)';
            _.context.stroke();
            _.sphereObject = new THREE.Mesh( geometry, material );
            _.sphereObject.visible = this._.options.showLand;
            _.texture.needsUpdate = false;
        }
        tj.addGroup(_.sphereObject);
    }

    return {
        name: 'textureThreejs',
        onInit() {
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.graticule.visible = this._.options.showDrawing;
        }
    }
}
