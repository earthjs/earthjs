// John J Czaplewski’s Block http://bl.ocks.org/jczaplew/6798471
export default function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = {
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
        var this$1 = this;

        var __ = this._;
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
                        var loop = function () {
                            var scountry = list[i];

                            this$1.canvasPlugin.render(function(context, path) {
                                context.beginPath();
                                path(scountry);
                                context.fillStyle = scountry.color;
                                context.fill();
                            }, _.drawTo, _.options);
                        };

                        for (var i = 0, list = _.selected.features; i < list.length; i += 1) loop();
                    }
                }
                var ref = this.hoverCanvas.states();
                var country = ref.country;
                if (country && !_.selected.features.find(function (obj){ return obj.id===country.id; })) {
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

    function canvasAddCountries(border) {
        if ( border === void 0 ) border=false;

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
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            var options = this._.options;
            options.showLand = true;
            options.showLakes = true;
            options.showBorder = false;
            options.showCountries = true;
            options.transparentLand = false;
        },
        onCreate: function onCreate() {
            var this$1 = this;

            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
            if (this.hoverCanvas) {
                var hover = {};
                hover[_.me.name] = function () {
                    if (!this$1._.options.spin) {
                        this$1._.refresh()
                    }
                };
                this.hoverCanvas.onCountry(hover);
            }
        },
        onRefresh: function onRefresh() {
            create.call(this);
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
        selectedCountries: function selectedCountries(arr, multiColor) {
            if ( multiColor === void 0 ) multiColor=false;

            if (arr) {
                _.selected.features = arr;
                _.selected = {type: 'FeatureCollection', features: arr, multiColor: multiColor};
            } else {
                return _.selected.features;
            }
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.land  = topojson.feature(data$1, data$1.objects.land);
                _.countries.features = topojson.feature(data$1, data$1.objects.countries).features;
                if (data$1.objects.ne_110m_lakes)
                    { _.lakes.features = topojson.feature(data$1, data$1.objects.ne_110m_lakes).features; }
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world     = all.world;
                _.land      = all.land;
                _.lakes     = all.lakes;
                _.countries = all.countries;
            } else {
                var world = _.world;
                var land = _.land;
                var lakes = _.lakes;
                var countries = _.countries;
                return {world: world, land: land, lakes: lakes, countries: countries};
            }
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        options: function options(options$1) {
            _.options = options$1;
        }
    }
}
