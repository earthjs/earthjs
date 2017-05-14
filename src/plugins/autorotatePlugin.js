export default degPerSec => {
    const _ = {
        spin: true,
        lastTick: null,
        degree: degPerSec,
        sync: []
    }

    function rotate(delta) {
        const r = this._.proj.rotate();
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
            const now = new Date();
            if (!_.lastTick || !_.spin || this._.drag) {
                _.lastTick = now;
            } else {
                const delta = now - _.lastTick;
                rotate.call(this, delta);
                _.sync.forEach(p => rotate.call(p, delta));
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
