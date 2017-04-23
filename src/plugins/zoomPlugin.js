export default function() {
    return {
        name: 'zoomPlugin',
        onInit(planet, options) {
            var zoom = d3.zoom()
                .scaleExtent([planet.proj.scale(), 1000])
                .translateExtent([[-100, -100], [90, 100]]);
            zoom
                .on("start", zoomstart)
                .on("end",   zoomend)
                .on('zoom',  function() {
                    var e = d3.event;
                    if (e.sourceEvent) {
                        var t = e.transform;
                        if (e.sourceEvent.constructor.name==='WheelEvent') {
                            planet.proj.scale(t.k);
                            planet.resize(planet, options);
                            planet.refresh(planet, options);

                        } else if (e.sourceEvent.constructor.name==='MouseEvent') {
                            var rX = rotateScale(t.x);// % 360;
                            var rY = rotateScale(t.y);// % 360;

                            planet.proj.rotate([rX, -rY]).scale(t.k);
                            planet.refresh(planet, options);
                        }
                    }
                });

            var zoomSettings = d3.zoomIdentity.translate(0, 0).scale(planet.proj.scale());
            var rotateScale  = d3.scaleLinear()
                .domain([-1500, 0, 1500])
                .range([-250, 0, 250]);

            planet.svg
                .call(zoom)
                .call(zoom.transform, zoomSettings)

            function zoomstart(){
                planet.state.drag = true;
            }

            function zoomend(){
                planet.state.drag = false;
            }
        }
    }
}
