export default function(degPerSec) {
    var _ = {
        spin: true,
        lastTick: null,
        degree: degPerSec,
        sync: []
    }

    function rotate(delta, degree) {
        var r = this._.proj.rotate();
        r[0] += _.degree * delta / 1000;
        if (r[0] >= 180)
            r[0] -= 360;
        this._.rotate(r);
    }

    return {
        name: 'autorotatePlugin',
        onInit() {
            this._.options.spin = true;
        },
        onInterval() {
            var now = new Date();
            if (!_.lastTick || !_.spin || this._.drag) {
                _.lastTick = now;
            } else {
                var delta = now - _.lastTick;
                rotate.call(this, delta, _.degree);
                _.sync.forEach(function(p) {
                    rotate.call(p, delta, _.degree);
                })
                _.lastTick = now;
            }
        },
        speed(degPerSec) {
            _.degree = degPerSec;
        },
        start() {
            _.spin = true;
        },
        stop() {
            _.spin = false;
        },
        sync(arr) {
            _.sync = arr;
        }
    };
}
