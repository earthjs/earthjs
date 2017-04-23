export default function() {
    return {
        name: 'wheelZoomPlugin',
        onInit(planet, options) {
            planet.svg.on('wheel', function() {
                var y = d3.event.deltaY+ planet.proj.scale();
                // var y = (y>=4 ? y/4 : y) + planet.proj.scale();
                if (y>230 && y<1000) {
                    planet.scale(y);
                }
            });
        }
    }
}
