export default function() {
    return {
        name: 'configPlugin',
        set(planet, options, newOpt) {
            if (newOpt) {
                Object.assign(options, newOpt);
                if (newOpt.stop!==undefined) {
                    var p = planet.autorotatePlugin;
                    newOpt.stop ? p.stop() : p.start();
                }
                planet._.drag = true;
                planet.svgDraw();
                planet._.drag = false;
            }
            return Object.assign({}, options);
        }
    }
}
