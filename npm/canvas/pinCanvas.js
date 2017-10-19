export default function (urlJson, urlImage, wh) {
    if ( wh === void 0 ) wh=[15,25];

    /*eslint no-console: 0 */
    var _ = {dataPin: null, image: null, w: null, h: null};
    d3.select('body').append('img')
        .attr('src',urlImage)
        .attr('id',    'pin')
        .attr('width',   '0')
        .attr('height',  '0');
        _.image = document.getElementById('pin');

    function init(wh) {
        this._.options.showPin = true;
        var sc = this._.proj.scale();
        _.w = d3.scaleLinear().domain([0,sc]).range([0,wh[0]]);
        _.h = d3.scaleLinear().domain([0,sc]).range([0,wh[1]]);
        resize.call(this);
    }

    function create() {
        if (this._.options.showPin) {
            var _$1 = this._;
            var center = _$1.proj.invert(_$1.center);
            this.canvasPlugin.render(function(context) {
                if (_.dataPin) {
                    _.dataPin.features.forEach(function(d) {
                        var coordinates = d.geometry.coordinates;
                        if (d3.geoDistance(coordinates, center) <= 1.57) {
                            var a = _$1.path.centroid(d);
                            context.drawImage(_.image,
                                a[0]-_.pX,
                                a[1]-_.pY,
                                _.wh[0],
                                _.wh[1]
                            );
                        }
                    });
                }
            }, _.drawTo);
        }
    }

    function resize() {
        var __ = this._;
        var sc = __.proj.scale();
        var wh = [_.w(sc), _.h(sc)];
        _.wh = wh;
        _.pX = wh[0]/2;
        _.pY = wh[1];
    }

    return {
        name: 'pinCanvas',
        urls: urlJson && [urlJson],
        onReady: function onReady(err, json) {
            _.me.data(json);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this, wh);
        },
        onCreate: function onCreate() {
            var this$1 = this;

            setTimeout(function (){ return create.call(this$1); },1);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        onRefresh: function onRefresh() {
            create.call(this);
        },
        data: function data(data$1) {
            if (data$1) {
                _.dataPin = data$1;
            } else {
                return _.dataPin;
            }
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        image: function image() {
            return _.image;
        },
        size: function size(wh) {
            if (wh) {
                _.wh = wh;
                init.call(this, wh);
            } else {
                return _.wh;
            }
        }
    }
}
