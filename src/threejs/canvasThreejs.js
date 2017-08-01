// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default worldUrl => {
    /*eslint no-console: 0 */
    const _ = {
        sphereObject:null,
        onDraw: {},
        onDrawVals: [],
        material: new THREE.MeshBasicMaterial({transparent:false})
    };

    function init() {
        const o = this._.options;
        o.showTjCanvas = true;
        o.transparentLand = false;
        const SCALE = this._.proj.scale();
        _.geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        _.canvas = d3.select('body').append('canvas')
            .style('position','absolute')
            .style('display','none')
            .style('top','450px')
            .attr('width','1024')
            .attr('height','512')
            .attr('id','tjs-canvas')
            .node();
        _.texture = new THREE.Texture(_.canvas);
        _.material.map = _.texture;

        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().precision(0.5).translate([512, 256]).scale(163);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
    }

    function create() {
        const o = this._.options;
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            _.sphereObject= new THREE.Mesh(_.geometry, _.material);
        }
        _.material.transparent = (o.transparent || o.transparentLand);
        _.context.clearRect(0, 0, 1024, 512);
        _.context.fillStyle = '#00ff00';
        _.context.beginPath();
        _.path(_.countries);
        _.context.fill();

        _.onDrawVals.forEach(v => {
            v.call(this, _.context, _.path);
        });

        _.texture.needsUpdate = true;
        _.sphereObject.visible = o.showTjCanvas;
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'canvasThreejs',
        urls: worldUrl && [worldUrl],
        onReady(err, data) {
            this.canvasThreejs.data(data);
        },
        onInit() {
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            _.sphereObject.visible = this._.options.showTjCanvas;
        },
        onDraw(obj) {
            Object.assign(_.onDraw, obj);
            _.onDrawVals = Object.keys(_.onDraw).map(k => _.onDraw[k]);
        },
        data(data) {
            if (data) {
                _.world = data;
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return  _.world;
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
