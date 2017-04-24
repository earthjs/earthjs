export default function(degPerSec) {
    var _ = {
        stop: false,
        lastTick: null,
        degree: degPerSec
    }

    return {
        name: 'autorotatePlugin',
        onInit(planet, options) {},
        onInterval(planet, options) {
            var now = new Date();
            if (planet._.drag || _.stop || !_.lastTick) {
                _.lastTick = now;
            } else {
                var delta = now - _.lastTick;
                var rotation = planet._.proj.rotate();
                rotation[0] += _.degree * delta / 1000;
                if (rotation[0] >= 180)
                    rotation[0] -= 360;
                planet._.proj.rotate(rotation);
                planet._.refresh(planet, options);
                _.lastTick = now;
            }
        },
        speed(planet, options, degPerSec) {
            _.degree = degPerSec;
        },
        start(planet, options) {
            _.stop = false;
        },
        stop(planet, options) {
            _.stop = true;
        }
    };
}
