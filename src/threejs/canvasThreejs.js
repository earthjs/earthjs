// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default (worldUrl='../d/world-110m.json',scw=6.279,height=2048) => {
    /*eslint no-console: 0 */
    const _ = {
        sphereObject:null,
        style: {},
        onDraw: {},
        onDrawVals: [],
        selected: {
            type: 'FeatureCollection',
            features:[]
        },
        material: new THREE.MeshBasicMaterial({transparent:false})
    };

    function init() {
        const width = height * 2;
        const o = this._.options;
        o.showLand = true;
        o.showTjCanvas = true;
        o.transparentLand = false;
        const SCALE = this._.proj.scale();
        _.geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        _.newCanvas = document.createElement('canvas');
        _.newContext = _.newCanvas.getContext('2d');

        _.texture = new THREE.Texture(_.newCanvas);
        _.material.map = _.texture;

        _.canvas = d3.select('body').append('canvas')
            .style('position','absolute')
            .style('display','none')
            .style('top','450px')
            .attr('width', width)
            .attr('height',height)
            .attr('id','tjs-canvas')
            .node();
        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().scale(width/scw).translate([width/2, height/2]);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
        _.path2 = d3.geoPath().projection(_.proj).context(_.newContext);

        //set dimensions
        _.newCanvas.width = _.canvas.width;
        _.newCanvas.height = _.canvas.height;
    }

    function create() {
        const o = this._.options;
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            if (o.showBorder) {
                _.context.clearRect(0, 0, _.canvas.width, _.canvas.height);
            } else {
                _.context.fillStyle = "blue";
                _.context.fillRect(0, 0, _.canvas.width, _.canvas.height);
            }
            _.context.beginPath();
            _.path(_.countries);
            if (!o.showBorder) {
                _.context.fillStyle = '#00ff00';
                _.context.fill();
            }
            if (o.showBorder || o.showBorder===undefined) {
                _.context.strokeStyle = _.style.countries || 'rgb(239, 237, 234)'; //'rgb(0, 37, 34)';
                _.context.stroke();
            }
            //apply the old canvas to the new one
            _.newContext.drawImage(_.canvas, 0, 0);
            _.refresh = true;
            _.sphereObject= new THREE.Mesh(_.geometry, _.material);
        }
        _.material.transparent = (o.transparent || o.transparentLand);
        _.onDrawVals.forEach(v => {
            v.call(this, _.newContext, _.path);
        });

        _.sphereObject.visible = o.showTjCanvas;
        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    function refresh() {
        if (_.refresh &&
            this.hoverCanvas &&
            this._.options.showSelectedCountry) {
            _.refresh = false;
            _.newContext.clearRect(0, 0, _.canvas.width, _.canvas.height);
            _.newContext.drawImage(_.canvas, 0, 0);
            if (_.selected.features.length>0) {
                _.newContext.beginPath();
                _.path2(_.selected);
                _.newContext.fillStyle = _.style.selected || 'rgba(255, 235, 0, 0.4)'; // 'rgba(87, 255, 99, 0.4)';
                _.newContext.fill();
            }
            const country = this.hoverCanvas.country();
            if (country && !_.selected.features.find(obj=>obj.id===country.id)) {
                _.newContext.beginPath();
                _.path2(country);
                _.newContext.fillStyle = _.style.hover || 'rgba(117, 0, 0, 0.4)'; //'rgb(137, 138, 34)';
                _.newContext.fill();
            }
            _.texture.needsUpdate = true;
            this.threejsPlugin.renderThree();
        }
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
            refresh.call(this);
        },
        onDraw(obj) {
            Object.assign(_.onDraw, obj);
            _.onDrawVals = Object.keys(_.onDraw).map(k => _.onDraw[k]);
        },
        selectedCountries(arr) {
            if (arr) {
                _.selected.features = arr;
            } else {
                return _.selected.features;
            }
        },
        data(data) {
            if (data) {
                _.world = data;
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return  _.world;
            }
        },
        style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        refresh() {
            _.refresh = true;
            refresh.call(this);
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
