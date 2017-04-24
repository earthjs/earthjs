export default function() {
    return {
        name: 'wheelZoomPlugin',
        onInit(planet) {
            planet._.svg.on('wheel', function() {
                var y = d3.event.deltaY+ planet._.proj.scale();
                // var y = (y>=4 ? y/4 : y) + planet._.proj.scale();
                if (y>230 && y<1000) {
                    planet._.scale(y);
                }
            });
        }
    }
}
