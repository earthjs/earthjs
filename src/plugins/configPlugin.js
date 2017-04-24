export default function() {
    return {
        name: 'configPlugin',
        set(planet, options, newOpt) {
            if (newOpt) {
                Object.assign(options, newOpt);
                planet.state.drag = true;
                planet.recreateSvg(planet);
                planet.state.drag = false;
            }
            return Object.assign({}, options);
        }
    }
}
