earthjs.plugins.autorotatePlugin = function(degPerSec) {
    var lastTick = null;
    return {
        name: 'autorotatePlugin',
        onInit(planet, options) {
            planet.degPerSec = degPerSec;
            options.stop = false;
        },
        onInterval(planet, options) {
            var now = new Date();
            if (planet.state.drag || options.stop || !lastTick) {
                lastTick = now;
            } else {
                var delta = now - lastTick;
                var rotation = planet.proj.rotate();
                rotation[0] += planet.degPerSec * delta / 1000;
                if (rotation[0] >= 180)
                    rotation[0] -= 360;
                planet.proj.rotate(rotation);
                planet.refresh(planet, options);
                lastTick = now;
            }
        },
        speed(planet, options, degPerSec) {
            planet.degPerSec = degPerSec;
        },
        start(planet, options) {
            options.stop = false;
        },
        stop(planet, options) {
            options.stop = true;
        }
    };
};
