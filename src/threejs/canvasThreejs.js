// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default (worldUrl, scw=6.279, height=2048) => {
    /*eslint no-console: 0 */
    const _ = {
        world: null,
        sphereObject:null,
        style: {},
        onDraw: {},
        onDrawVals: [],
        countries: {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[]},
        material: new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.5
        })
    };

    function init() {
        const width = height * 2;
        const SCALE = this._.proj.scale();
        _.geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        _.newCanvas = d3.select('body').append('canvas') // document.createElement('canvas');
            .style('display','none')
            .attr('class','ej-canvas-new')
            .node();
        _.newContext = _.newCanvas.getContext('2d');
        _.texture = new THREE.Texture(_.newCanvas);
        _.texture.transparent = true;
        _.material.map = _.texture;

        _.canvas = d3.select('body').append('canvas')
            .style('display','none')
            .attr('width', width)
            .attr('height',height)
            .attr('class','ej-canvas-ctx')
            .node();
        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().scale(width/scw).translate([width/2, height/2]);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
        _.path2 = d3.geoPath().projection(_.proj).context(_.newContext);

        //set dimensions
        _.newCanvas.width = _.canvas.width;
        _.newCanvas.height = _.canvas.height;
        _.me._ = _; // only for debugging
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            resize.call(this);
            _.sphereObject= new THREE.Mesh(_.geometry, _.material);
        }
        _.onDrawVals.forEach(v => {
            v.call(this, _.newContext, _.path);
        });

        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    function choropleth() {
        const o = this._.options;
        if (o.choropleth) {
            let i = _.countries.features.length;
            while (i--) {
                var obj = _.countries.features[i];
                _.context.beginPath();
                _.path(obj);
                _.context.fillStyle = obj.color || _.style.countries || 'rgba(2, 20, 37,0.8)';
                _.context.fill();
            }
            return true;
        } else {
            _.path(_.countries);
            _.context.fillStyle = _.style.countries || 'rgba(2, 20, 37,0.8)';
            _.context.fill();
            return false;
        }
    }

    // stroke adjustment when zooming
    const scale10 = d3.scaleLinear().domain([30, 450]).range([10, 2]);
    function resize() {
        const o = this._.options;
        if (_.style.ocean) {
            _.context.fillStyle = _.style.ocean;
            _.context.fillRect(0, 0, _.canvas.width, _.canvas.height);
        } else {
            _.context.clearRect(0, 0, _.canvas.width, _.canvas.height);
        }
        let border = o.showBorder;
        _.context.beginPath();
        if (!border) {
            choropleth.call(this);
        }
        if (o.showBorder || o.showBorder===undefined) {
            let sc = scale10(this._.proj.scale());
            if (sc < 1)
                sc = 1;
            if (border) {
                _.path(_.allCountries);
            }
            _.context.lineWidth = sc;
            _.context.strokeStyle = _.style.border || 'rgb(239, 237, 234)';
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
                _.newContext.fillStyle = _.style.selected || 'rgba(87, 255, 99, 0.5)'; // 0.4 'rgba(255, 235, 0, 0.4)'; // 'rgba(87, 255, 99, 0.4)';
                _.newContext.fill();
            }
            const {country} = this.hoverCanvas.states();
            if (country && !_.selected.features.find(obj=>obj.id===country.id)) {
                _.newContext.beginPath();
                _.path2(country);
                _.newContext.fillStyle = _.style.hover || 'rgba(117, 0, 0, 0.5)'; // 0.4 'rgb(137, 138, 34)';
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
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            if (this.worldJson && !_.world) {
                _.me.data(this.worldJson.data());
            }
            create.call(this);
        },
        onResize() {
            resize.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        onDraw(obj) {
            Object.assign(_.onDraw, obj);
            _.onDrawVals = Object.keys(_.onDraw).map(k => _.onDraw[k]);
        },
        countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
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
                _.allCountries = topojson.feature(data, data.objects.countries);
                _.countries.features = _.allCountries.features;
            } else {
                return  _.world;
            }
        },
        allData(all) {
            if (all) {
                _.world     = all.world;
                _.countries = all.countries;
            } else {
                const  {world, countries} = _;
                return {world, countries};
            }
        },
        style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        reload() {
            resize.call(this);
            refresh.call(this);
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
