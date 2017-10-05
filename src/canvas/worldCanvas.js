// John J Czaplewski’s Block http://bl.ocks.org/jczaplew/6798471
export default worldUrl => {
    /*eslint no-console: 0 */
    const _ = {
        style:   {},
        options: {},
        drawTo: null,
        world:  null,
        land:   null,
        lakes:     {type: 'FeatureCollection', features:[]},
        countries: {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[], multiColor: false},
    };

    function create() {
        const __ = this._;
        if (_.world) {
            if (__.options.transparent || __.options.transparentLand) {
                this.canvasPlugin.flipRender(function(context, path) {
                    context.beginPath();
                    path(_.land);
                    context.fillStyle = _.style.backLand || 'rgba(119,119,119,0.2)';
                    context.fill();
                }, _.drawTo, _.options);
            }
            if (__.options.showLand) {
                if (__.options.showCountries || _.me.showCountries) {
                    canvasAddCountries.call(this, __.options.showBorder);
                } else  {
                    canvasAddWorld.call(this);
                }
                if (!__.drag && __.options.showLakes) {
                    canvasAddLakes.call(this);
                }
            } else if (__.options.showBorder) {
                canvasAddCountries.call(this, true);
            }
            if (this.hoverCanvas && __.options.showSelectedCountry) {
                if (_.selected.features.length>0) {
                    if (!_.selected.multiColor) {
                        this.canvasPlugin.render(function(context, path) {
                            context.beginPath();
                            path(_.selected);
                            context.fillStyle = _.style.selected || 'rgba(87, 255, 99, 0.5)';
                            context.fill();
                        }, _.drawTo, _.options);
                    } else {
                        for (let scountry of _.selected.features) {
                            this.canvasPlugin.render(function(context, path) {
                                context.beginPath();
                                path(scountry);
                                context.fillStyle = scountry.color;
                                context.fill();
                            }, _.drawTo, _.options);
                        }
                    }
                }
                const {country} = this.hoverCanvas.states();
                if (country && !_.selected.features.find(obj=>obj.id===country.id)) {
                    this.canvasPlugin.render(function(context, path) {
                        context.beginPath();
                        path(country);
                        context.fillStyle = _.style.hover || 'rgba(117, 0, 0, 0.5)';
                        context.fill();
                    }, _.drawTo, _.options);
                }
            }
        }
    }

    function canvasAddWorld() {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.land);
            context.fillStyle = _.style.land || 'rgba(2, 20, 37,0.8)';
            context.fill();
        }, _.drawTo, _.options);
    }

    function canvasAddCountries(border=false) {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.countries);
            if (!border) {
                context.fillStyle =  _.style.countries || 'rgba(2, 20, 37,0.8)';
                context.fill();
            }
            context.lineWidth = 0.1;
            context.strokeStyle = _.style.border || 'rgb(239, 237, 234)';
            context.stroke();
        }, _.drawTo, _.options);
    }

    function canvasAddLakes() {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.lakes);
            context.fillStyle = _.style.lakes || 'rgba(80, 87, 97, 0.5)';
            context.fill();
        }, _.drawTo, _.options);
    }

    return {
        name: 'worldCanvas',
        urls: worldUrl && [worldUrl],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            const options = this._.options;
            options.showLand = true;
            options.showLakes = true;
            options.showBorder = false;
            options.showCountries = true;
            options.transparentLand = false;
        },
        onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
            if (this.hoverCanvas) {
                const hover = {};
                hover[_.me.name] = () => {
                    if (!this._.options.spin) {
                        this._.refresh()
                    }
                };
                this.hoverCanvas.onCountry(hover);
            }
        },
        onRefresh() {
            create.call(this);
        },
        countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
        selectedCountries(arr, multiColor=false) {
            if (arr) {
                _.selected.features = arr;
                _.selected = {type: 'FeatureCollection', features: arr, multiColor};
            } else {
                return _.selected.features;
            }
        },
        data(data) {
            if (data) {
                _.world = data;
                _.land  = topojson.feature(data, data.objects.land);
                _.lakes.features = topojson.feature(data, data.objects.ne_110m_lakes).features;
                _.countries.features = topojson.feature(data, data.objects.countries).features;
            } else {
                return _.world;
            }
        },
        allData(all) {
            if (all) {
                _.world     = all.world;
                _.land      = all.land;
                _.lakes     = all.lakes;
                _.countries = all.countries;
            } else {
                const  {world, land, lakes, countries} = _;
                return {world, land, lakes, countries};
            }
        },
        drawTo(arr) {
            _.drawTo = arr;
        },
        style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        options(options) {
            _.options = options;
        }
    }
}
