export default (urlJson, urlImage, wh=[15,25]) => {
    /*eslint no-console: 0 */
    const _ = {dataPin: null, image: null, w: null, h: null};
    d3.select('body').append('img')
        .attr('src',urlImage)
        .attr('id',    'pin')
        .attr('width',   '0')
        .attr('height',  '0');
        _.image = document.getElementById('pin');

    function init(wh) {
        this._.options.showPin = true;
        const sc = this._.proj.scale();
        _.w = d3.scaleLinear().domain([0,sc]).range([0,wh[0]]);
        _.h = d3.scaleLinear().domain([0,sc]).range([0,wh[1]]);
        resize.call(this);
    }

    function create() {
        if (this._.options.showPin) {
            const __ = this._;
            const center = __.proj.invert(__.center);
            this.canvasPlugin.render(function(context) {
                if (_.dataPin) {
                    _.dataPin.features.forEach(function(d) {
                        const coordinates = d.geometry.coordinates;
                        if (d3.geoDistance(coordinates, center) <= 1.57) {
                            const a = __.path.centroid(d);
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
        const __ = this._;
        const sc = __.proj.scale();
        const wh = [_.w(sc), _.h(sc)];
        _.wh = wh;
        _.pX = wh[0]/2;
        _.pY = wh[1];
    }

    return {
        name: 'pinCanvas',
        urls: urlJson && [urlJson],
        onReady(err, json) {
            _.me.data(json);
        },
        onInit(me) {
            _.me = me;
            init.call(this, wh);
        },
        onCreate() {
            setTimeout(()=>create.call(this),1);
        },
        onResize() {
            resize.call(this);
        },
        onRefresh() {
            create.call(this);
        },
        data(data) {
            if (data) {
                _.dataPin = data;
            } else {
                return _.dataPin;
            }
        },
        drawTo(arr) {
            _.drawTo = arr;
        },
        image() {
            return _.image;
        },
        size(wh) {
            if (wh) {
                _.wh = wh;
                init.call(this, wh);
            } else {
                return _.wh;
            }
        }
    }
}
