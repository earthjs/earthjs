export default (degPerSec=10) => {
    /*eslint no-console: 0 */
    const _ = {
        lastTick: new Date(),
        degree: degPerSec/1000,
        sync: []
    }

    function create() {
        const o = this._.options;
        if (this.clickCanvas) {
            this.clickCanvas.onCountry({
                autorotatePlugin(e, country) {
                    if (!country) {
                        o.spin = !o.spin;
                    }
                }
            })
        }
    }

    let start = 0;
    function interval(timestamp) {
        if ((timestamp - start) > 40) {
            start = timestamp;
            const now = new Date();
            if (this._.options.spin && !this._.drag) {
                const delta = now - _.lastTick;
                rotate.call(this, delta);
                _.sync.forEach(g => rotate.call(g, delta));
            }
            _.lastTick = now;
        }
    }

    function rotate(delta) {
        const r = this._.proj.rotate();
        r[0] += _.degree * delta;
        this._.rotate(r);
    }

    return {
        name: 'autorotatePlugin',
        onInit(me) {
            _.me = me;
            this._.options.spin = true;
        },
        onCreate() {
            create.call(this);
        },
        onInterval(t) {
            interval.call(this, t);
        },
        speed(degPerSec) {
            _.degree = degPerSec/1000;
        },
        sync(arr) {
            _.sync = arr;
        },
        start() {
            this._.options.spin = true;
        },
        stop() {
            this._.options.spin = false;
        },
        spin(rotate) {
            if (rotate!==undefined) {
                this._.options.spin = rotate;
            } else {
                return this._.options.spin;
            }
        }
    };
}
