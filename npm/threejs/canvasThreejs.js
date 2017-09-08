// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default function (worldUrl, scw, height) {
    if ( scw === void 0 ) scw=6.279;
    if ( height === void 0 ) height=2048;

    /*eslint no-console: 0 */
    var _ = {
        world: null,
        sphereObject:null,
        style: {},
        onDraw: {},
        onDrawVals: [],
        selected: {
            type: 'FeatureCollection',
            features:[]
        },
        material: new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            alphaTest: 0.5
        })
    };

    function init() {
        var width = height * 2;
        var SCALE = this._.proj.scale();
        _.geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        _.newCanvas = document.createElement('canvas');
        _.newContext = _.newCanvas.getContext('2d');

        _.texture = new THREE.Texture(_.newCanvas);
        _.texture.transparent = true;
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
        var this$1 = this;

        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            resize.call(this);
            _.sphereObject= new THREE.Mesh(_.geometry, _.material);
        }
        _.onDrawVals.forEach(function (v) {
            v.call(this$1, _.newContext, _.path);
        });

        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    function choropleth() {
        var o = this._.options;
        if (o.choropleth) {
            var i = _.countries.features.length;
            while (i--) {
                var obj = _.countries.features[i];
                _.context.beginPath();
                _.path(obj);
                _.context.fillStyle = obj.color || '#8f9fc1'; //"rgb(" + (i+1) + ",0,0)";
                _.context.fill();
            }
            return true;
        } else {
            _.path(_.countries);
            _.context.fillStyle = '#8f9fc1'; // '#00ff00';
            _.context.fill();
            return false;
        }
    }

    // stroke adjustment when zooming
    var scale10 = d3.scaleLinear().domain([30, 450]).range([10, 2]);
    function resize() {
        var o = this._.options;
        if (_.style.ocean) {
            _.context.fillStyle = _.style.ocean;
            _.context.fillRect(0, 0, _.canvas.width, _.canvas.height);
        } else {
            _.context.clearRect(0, 0, _.canvas.width, _.canvas.height);
        }
        var crp = true;
        _.context.beginPath();
        if (!o.showBorder) {
            crp = choropleth.call(this);
        }
        if (o.showBorder || o.showBorder===undefined) {
            var sc = scale10(this._.proj.scale());
            if (sc < 1)
                { sc = 1; }
            if (crp) {
                _.path(_.countries);
            }
            _.context.lineWidth = sc;
            _.context.strokeStyle = _.style.countries || 'rgb(239, 237, 234)'; //'rgb(0, 37, 34)';
            _.context.stroke();
        }
        //apply the old canvas to the new one
        _.newContext.drawImage(_.canvas, 0, 0);
        _.refresh = true;
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
            var ref = this.hoverCanvas.states();
            var country = ref.country;
            if (country && !_.selected.features.find(function (obj){ return obj.id===country.id; })) {
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
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        onDraw: function onDraw(obj) {
            Object.assign(_.onDraw, obj);
            _.onDrawVals = Object.keys(_.onDraw).map(function (k) { return _.onDraw[k]; });
        },
        selectedCountries: function selectedCountries(arr) {
            if (arr) {
                _.selected.features = arr;
            } else {
                return _.selected.features;
            }
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.countries = topojson.feature(data$1, data$1.objects.countries);
            } else {
                return  _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world     = all.world;
                _.countries = all.countries;
            } else {
                var world = _.world;
                var countries = _.countries;
                return {world: world, countries: countries};
            }
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        refresh: function refresh$1() {
            _.refresh = true;
            refresh.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
