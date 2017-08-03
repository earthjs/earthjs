// John J Czaplewski’s Block http://bl.ocks.org/jczaplew/6798471
export default function (worldUrl) {
    /*eslint no-console: 0 */
    var color = {
        0:'rgba(117, 87, 57, 0.6)',
        1:'rgba(138, 96, 56, 0.6)',
        2:'rgba(140,104, 63, 0.6)',
        3:'rgba(149,114, 74, 0.6)',
        4:'rgba(153,126, 87, 0.6)',
        5:'rgba(155,141,115, 0.6)'}
    var _ = {world: null, style: {}, drawTo: null, options: {}, landColor: 0};

    function create() {
        var __ = this._;
        if (_.world && __.options.showLand) {
            if (__.options.transparent || __.options.transparentLand) {
                this.canvasPlugin.flipRender(function(context, path) {
                    context.beginPath();
                    path(_.land);
                    context.fillStyle = _.style.backLand || 'rgba(119,119,119,0.2)';
                    context.fill();
                }, _.drawTo, _.options);
            }
            __.options.showCountries ? canvasAddCountries.call(this) : canvasAddWorld.call(this);
            if (!__.drag) {
                __.options.showLakes && canvasAddLakes.call(this);
                if (this.hoverCanvas && __.options.showSelectedCountry) {
                    var country = this.hoverCanvas.country();
                    if (country) {
                        this.canvasPlugin.render(function(context, path) {
                            context.beginPath();
                            path(country);
                            context.fillStyle = 'rgba(117, 0, 0, 0.4)';
                            context.fill();
                        }, _.drawTo, _.options);                        
                    }
                }
            }
        }
    }

    function canvasAddWorld() {
        this.canvasPlugin.render(function(context, path) {
            var c = _.landColor;
            context.beginPath();
            path(_.land);
            context.fillStyle = _.style.land || (typeof(c)==='number' ? color[c] : c);
            context.fill();
        }, _.drawTo, _.options);
    }

    function canvasAddCountries() {
        this.canvasPlugin.render(function(context, path) {
            var c = _.landColor;
            context.beginPath();
            path(_.countries);
            context.fillStyle = _.style.land || (typeof(c)==='number' ? color[c] : c);
            context.fill();
            context.lineWidth = 0.1;
            context.strokeStyle = _.style.countries || 'rgb(239, 237, 234)';
            context.stroke();
        }, _.drawTo, _.options);
    }

    function canvasAddLakes() {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.lakes);
            context.fillStyle = _.style.lakes || 'rgba(80, 87, 97, 0.4)';
            context.fill();
        }, _.drawTo, _.options);
    }

    return {
        name: 'worldCanvas',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            this.worldCanvas.data(data);
            Object.defineProperty(this._.options, 'landColor', {
                get: function () { return _.landColor; },
                set: function (x) {
                    _.landColor = x;
                }
            });
        },
        onInit: function onInit() {
            var options = this._.options;
            options.showLand = true;
            options.showLakes = true;
            options.showCountries = true;
            options.transparentLand = false;
            options.landColor = 0;
        },
        onCreate: function onCreate() {
            var this$1 = this;

            create.call(this);
            if (this.hoverCanvas) {
                var worldCanvas = function () {
                    if (!this$1._.options.spin) {
                        this$1._.refresh()
                    }
                };
                this.hoverCanvas.onCountry({worldCanvas: worldCanvas});
            }
        },
        onRefresh: function onRefresh() {
            create.call(this);
        },
        countries: function countries() {
            return _.countries.features;
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.land = topojson.feature(data$1, data$1.objects.land);
                _.lakes = topojson.feature(data$1, data$1.objects.ne_110m_lakes);
                _.countries = topojson.feature(data$1, data$1.objects.countries);
            } else {
                return _.world;
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
