export default () => {

    function init() {
        const m0, o0;
        const _this = this;

        function mousedown() {
          m0 = [d3.event.pageX, d3.event.pageY];
          o0 = _this._.proj.rotate();
          _this._.drag = true;
          d3.event.preventDefault();
        }

        function mousemove() {
          if (m0) {
            const m1 = [d3.event.pageX, d3.event.pageY]
              , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
            o1[1] = o1[1] > 30  ? 30  :
                    o1[1] < -30 ? -30 :
                    o1[1];
            _this._.rotate(o1);
          }
        }

        function mouseup() {
          if (m0) {
            mousemove();
            m0 = null;
            _this._.drag = false;
          }
        }

        const win = d3.select(window);
        win.on('mouseup',   mouseup);
        win.on('mousemove', mousemove);
        this._.svg.on('mousedown', mousedown);
    }

    return {
        name: 'dragPlugin',
        onInit() {
            init.call(this);
        },
    }
}
