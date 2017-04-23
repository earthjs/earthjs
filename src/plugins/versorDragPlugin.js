export default function() {
    return {
        name: 'versorDragPlugin',
        onInit(planet, options) {
            planet.svg.call(d3.drag()
                .on('start', dragstarted)
                .on('end',   dragsended)
                .on('drag',  dragged));

            var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
                r0, // Projection rotation as Euler angles at start.
                q0; // Projection rotation as versor at start.

            function dragstarted() {
                planet.state.drag = true;
                v0 = versor.cartesian(planet.proj.invert(d3.mouse(this)));
                r0 = planet.proj.rotate();
                q0 = versor(r0);
            }

            function dragsended() {
                planet.state.drag = false;
            }

            function dragged() {
                var v1 = versor.cartesian(planet.proj.rotate(r0).invert(d3.mouse(this))),
                    q1 = versor.multiply(q0, versor.delta(v0, v1)),
                    r1 = versor.rotation(q1);
                planet.rotate(r1);
            }
        }
    }
}
