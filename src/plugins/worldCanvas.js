// John J Czaplewski’s Block http://bl.ocks.org/jczaplew/6798471
export default (urlWorld, urlCountryNames) => {
    /*eslint no-debugger: 0 */
    /*eslint no-console: 0 */
    const _ = {world: null, countryNames: null, style: {}, drawTo: null, options: {}};

    function canvasAddWorldOrCountries() {
        const __ = this._;
        if (_.world && __.options.showLand) {
            if (!__.drag && __.options.transparent || __.options.transparentWorld) {
                __.proj.clipAngle(180);
                this.canvasPlugin.render(function(context, path) {
                    context.beginPath();
                    path(_.land);
                    context.fillStyle = _.style.backLand || 'rgba(119,119,119,0.2)';
                    context.fill();
                }, _.drawTo, _.options);
                __.proj.clipAngle(90);
            }
            if (!__.drag && __.options.showCountries) {
                canvasAddCountries.call(this);
                if (__.options.showLakes) {
                    canvasAddLakes.call(this);
                }
            } else {
                canvasAddWorld.call(this);
            }
            if (this.countrySelectCanvas) {
                const {country} = this.countrySelectCanvas.data();
                this.canvasPlugin.render(function(context, path) {
                    context.beginPath();
                    path(country);
                    context.fillStyle = 'rgba(117, 0, 0, 0.4)';
                    context.fill();
                });
            }
        }
    }

    function canvasAddWorld() {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.land);
            context.fillStyle = _.style.land || 'rgba(117, 87, 57, 0.4)';
            context.fill();
        }, _.drawTo, _.options);
    }

    function canvasAddCountries() {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.countries);
            context.lineWidth = 0.5;
            context.fillStyle = _.style.land || 'rgba(117, 87, 57, 0.4)';
            context.strokeStyle = _.style.countries || 'rgba(80, 64, 39, 0.6)';
            context.fill();
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

    let urls = null;
    if (urlWorld) {
        urls = [urlWorld];
        if (urlCountryNames) {
            urls.push(urlCountryNames);
        }
    }

    return {
        name: 'worldCanvas',
        urls: urls,
        onReady(err, world, countryNames) {
            this.worldCanvas.data({world, countryNames});
        },
        onInit() {
            const options = this._.options;
            options.showLand = true;
            options.showLakes = true;
            options.showCountries = true;
            options.transparentWorld = false;
            this.$fn.canvasAddWorldOrCountries = canvasAddWorldOrCountries;
        },
        onRefresh() {
            canvasAddWorldOrCountries.call(this);
        },
        data(data) {
            if (data) {
                _.world = data.world;
                _.countryNames = data.countryNames;
                _.land = topojson.feature(_.world, _.world.objects.land);
                _.lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);
                _.countries = topojson.feature(_.world, _.world.objects.countries);
            }
            return {
                world: _.world ,
                countryNames: _.countryNames
            }
        },
        countryName(d) {
            let cname = '';
            if (_.countryNames) {
                cname = _.countryNames.find(function(x) {
                    return x.id==d.id;
                });
            }
            return cname;
        },
        style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        drawTo(arr) {
            _.drawTo = arr;
        },
        options(options) {
            _.options = options;
        }
    }
}
