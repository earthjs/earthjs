// https://bl.ocks.org/mbostock/2b85250396c17a79155302f91ec21224
// https://bl.ocks.org/pbogden/2f8d2409f1b3746a1c90305a1a80d183
// http://www.svgdiscovery.com/ThreeJS/Examples/17_three.js-D3-graticule.htm
export default () => {
    /*eslint no-console: 0 */
    const _ = {};
    var geometry = new THREE.SphereGeometry( 200, 30, 30 );
    var material = new THREE.MeshBasicMaterial();

    function init() {
        this._.options.showDrawing = true;
        //http://bl.ocks.org/MAKIO135/eab7b74e85ed2be48eeb
        const __ = this._;
        const tj = this.threejsPlugin;
        var width   = __.options.width;
        var height  = __.options.height;
        if (!_.canvas) {
            const canvas = d3.select('body').append('canvas');
            canvas.attr('height', height).attr('width', width);
            _.canvas = canvas.node();
            _.context = _.canvas.getContext("2d");
            _.texture = new THREE.Texture(_.canvas);
            _.texture.needsUpdate = true;
            _.canvas.width = _.canvas.height = 512;
            material.map = _.texture;
        }

        var datumGraticule = d3.geoGraticule()();
        var projection = d3.geoMercator().scale(width/2/Math.PI)
            .translate([width/2, height/2]).precision(0.5);

        var path = d3.geoPath(projection, _.context);

        // var geometry = new THREE.BoxGeometry( 200, 200, 200 );
        _.sphereObject = new THREE.Mesh( geometry, material );
        _.sphereObject.visible = this._.options.showLand;
        // _.context.clearRect(0, 0, width, height);
        _.context.fillStyle = 'white';
        _.context.fillRect(0, 0, width, height);
        _.context.beginPath();
        path(datumGraticule);
        _.context.lineWidth = 0.4;
        _.context.strokeStyle = 'rgba(119,119,119,0.6)';
        _.context.stroke();
        tj.addGroup(_.sphereObject);
        // _.context.font = '20pt Arial';
        // _.context.fillStyle = 'red';
        // _.context.fillRect(0, 0, _.canvas.width, _.canvas.height);
        // _.context.fillStyle = 'white';
        // _.context.fillRect(10, 10, _.canvas.width - 20, _.canvas.height - 20);
        // _.context.fillStyle = 'black';
        // _.context.textAlign = "center";
        // _.context.textBaseline = "middle";
        // _.context.fillText(new Date().getTime(), _.canvas.width / 2, _.canvas.height / 2);
        tj.rotate();
        _.texture.needsUpdate = false;
    }

    function create() {
        const tj = this.threejsPlugin;
        const material = new THREE.LineBasicMaterial({color: 0xaaaaaa});
        _.graticule = tj.wireframe(_.graticule10, material); //0x800000
        _.graticule.visible = this._.options.showDrawing;
        tj.addGroup(_.graticule);
        tj.rotate();
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
