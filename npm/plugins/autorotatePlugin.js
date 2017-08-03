export default function (degPerSec) {
    if ( degPerSec === void 0 ) degPerSec=10;

    /*eslint no-console: 0 */
    var _ = {
        lastTick: new Date(),
        degree: degPerSec/1000,
        sync: []
    }

    function interval() {
        var now = new Date();
        if (this._.options.spin && !this._.drag) {
            var delta = now - _.lastTick;
            rotate.call(this, delta);
            _.sync.forEach(function (g) { return rotate.call(g, delta); });
        }
        _.lastTick = now;
    }

    function rotate(delta) {
        var r = this._.proj.rotate();
        r[0] += _.degree * delta;
        this._.rotate(r);
    }

    return {
        name: 'autorotatePlugin',
        onInit: function onInit() {
            this._.options.spin = true;
        },
        onInterval: function onInterval() {
            interval.call(this);
        },
        speed: function speed(degPerSec) {
            _.degree = degPerSec/1000;
        },
        start: function start() {
            this._.options.spin = true;
        },
        stop: function stop() {
            this._.options.spin = false;
        },
        sync: function sync(arr) {
            _.sync = arr;
        }
    };
}
