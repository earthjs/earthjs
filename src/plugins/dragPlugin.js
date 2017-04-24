export default function() {
    return {
        name: 'dragPlugin',
        onInit(planet, options) {
            var m0, o0;

            function mousedown() {
              m0 = [d3.event.pageX, d3.event.pageY];
              o0 = planet._.proj.rotate();
              planet._.drag = true;
              d3.event.preventDefault();
            }

            function mousemove() {
              if (m0) {
                var m1 = [d3.event.pageX, d3.event.pageY]
                  , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
                o1[1] = o1[1] > 30  ? 30  :
                        o1[1] < -30 ? -30 :
                        o1[1];
                planet._.proj.rotate(o1);
                planet._.refresh(planet, options);
              }
            }

            function mouseup() {
              if (m0) {
                mousemove();
                m0 = null;
                planet._.drag = false;
              }
            }

            var win = d3.select(window);
            win.on("mouseup",   mouseup);
            win.on("mousemove", mousemove);
            planet._.svg.on("mousedown", mousedown);
        },
    }
}
