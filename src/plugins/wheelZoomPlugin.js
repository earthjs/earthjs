earthjs.plugins.wheelZoomPlugin = function() {
    return {
        name: 'wheelZoomPlugin',
        onInit(planet, options) {
            var zoom = planet.svg
                .on('wheel',  function() {
                    var y = d3.event.deltaY;
                    var y = (y>=4 ? y/4 : y) + planet.proj.scale();
                    if (y>230 && y<1000) {
                        planet.proj.scale(y);
                        planet.resize(planet, options);
                        planet.refresh(planet, options);
                    }
                    // console.log(e.deltaY, planet.proj.scale());
                });
        }
    }
};
