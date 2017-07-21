// John J Czaplewski’s Block http://bl.ocks.org/jczaplew/6798471
export default worldUrl => {
    /*eslint no-console: 0 */
    const color = {
        0:'rgba(117, 87, 57, 0.6)',
        1:'rgba(138, 96, 56, 0.6)',
        2:'rgba(140,104, 63, 0.6)',
        3:'rgba(149,114, 74, 0.6)',
        4:'rgba(153,126, 87, 0.6)',
        5:'rgba(155,141,115, 0.6)'}
    const _ = {world: null, style: {}, drawTo: null, options: {}, landColor: 0};

    function create() {
        const __ = this._;
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
                    this.canvasPlugin.render(function(context, path) {
                        context.beginPath();
                        path(this.hoverCanvas.data().country);
                        context.fillStyle = 'rgba(117, 0, 0, 0.4)';
                        context.fill();
                    }, _.drawTo, _.options);
                }
            }
        }
    }

    function canvasAddWorld() {
        this.canvasPlugin.render(function(context, path) {
            const c = _.landColor;
            context.beginPath();
            path(_.land);
            context.fillStyle = _.style.land || (typeof(c)==='number' ? color[c] : c);
            context.fill();
        }, _.drawTo, _.options);
    }

    function canvasAddCountries() {
        this.canvasPlugin.render(function(context, path) {
            const c = _.landColor;
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
        onReady(err, data) {
            this.worldCanvas.data(data);
            Object.defineProperty(this._.options, 'landColor', {
                get: () => _.landColor,
                set: (x) => {
                    _.landColor = x;
                }
            });
        },
        onInit() {
            const options = this._.options;
            options.showLand = true;
            options.showLakes = true;
            options.showCountries = true;
            options.transparentLand = false;
            options.landColor = 0;
        },
        onCreate() {
            create.call(this);
            if (this.hoverCanvas) {
                const worldCanvas = () => {
                    if (!this._.options.spin) {
                        this._.refresh()
                    }
                };
                this.hoverCanvas.onCountry({worldCanvas});
            }
        },
        onRefresh() {
            create.call(this);
        },
        countries() {
            return _.countries.features;
        },
        data(data) {
            if (data) {
                _.world = data;
                _.land = topojson.feature(data, data.objects.land);
                _.lakes = topojson.feature(data, data.objects.ne_110m_lakes);
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return _.world;
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
