export default function (degPerSec) {
    if ( degPerSec === void 0 ) degPerSec=10;

    /*eslint no-console: 0 */
    var _ = {
        lastTick: new Date(),
        degree: degPerSec/1000,
        sync: []
    }

    function create() {
        var o = this._.options;
        if (this.clickCanvas) {
            this.clickCanvas.onCountry({
                autorotatePlugin: function autorotatePlugin(e, country) {
                    if (!country) {
                        o.spin = !o.spin;
                    }
                }
            })
        }
    }

    var start = 0;
    function interval(timestamp) {
        if ((timestamp - start) > 40) {
            start = timestamp;
            var now = new Date();
            if (this._.options.spin && !this._.drag) {
                var delta = now - _.lastTick;
                rotate.call(this, delta);
                _.sync.forEach(function (g) { return rotate.call(g, delta); });
            }
            _.lastTick = now;
        }
    }

    function rotate(delta) {
        var r = this._.proj.rotate();
        r[0] += _.degree * delta;
        this._.rotate(r);
    }

    return {
        name: 'autorotatePlugin',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.spin = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onInterval: function onInterval(t) {
            interval.call(this, t);
        },
        speed: function speed(degPerSec) {
            _.degree = degPerSec/1000;
        },
        sync: function sync(arr) {
            _.sync = arr;
        },
        start: function start() {
            this._.options.spin = true;
        },
        stop: function stop() {
            this._.options.spin = false;
        },
        spin: function spin(rotate) {
            if (rotate!==undefined) {
                this._.options.spin = rotate;
            } else {
                return this._.options.spin;
            }
        }
    };
}
