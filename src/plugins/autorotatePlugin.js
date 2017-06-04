export default degPerSec => {
    /*eslint no-console: 0 */
    const _ = {
        lastTick: new Date(),
        degree: degPerSec,
        sync: []
    }

    function rotate(delta) {
        const r = this._.proj.rotate();
        r[0] += _.degree * delta / 1000;
        this._.rotate(r);
    }

    return {
        name: 'autorotatePlugin',
        onInit() {
            this._.options.spin = true;
        },
        onInterval() {
            const now = new Date();
            if (!this._.options.spin || this._.drag) {
                _.lastTick = now;
            } else {
                const delta = now - _.lastTick;
                rotate.call(this, delta);
                _.sync.forEach(g => rotate.call(g, delta));
                _.lastTick = now;
            }
        },
        speed(degPerSec) {
            _.degree = degPerSec;
        },
        start() {
            this._.options.spin = true;
        },
        stop() {
            this._.options.spin = false;
        },
        sync(arr) {
            _.sync = arr;
        }
    };
}
