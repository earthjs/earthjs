export default function () {
    var _ = {dataPings: null, pings: []};

    function interval() {
        if (!this._.drag && this._.options.showPings) {
            var center;
            var proj = this._.proj;
            if (_.pings.length <= 7) {
                center = this._.proj.invert(this._.center);
                var visible = _.dataPings.features.filter(function(d) {
                    return d3.geoDistance(d.geometry.coordinates, center) <= 1.57
                })
                var d = visible[Math.floor(Math.random() * (visible.length-1))];
                _.pings.push({r: 2.5, l: d.geometry.coordinates});
            }
            var p = _.pings[0];
            if (d3.geoDistance(p.l, this._.proj.invert(this._.center)) > 1.57) {
                _.pings.shift();
            } else {
                if (!this._.options.spin) {
                    this._.refresh(/anvas/);
                }
                this.canvasPlugin.render(function(context) {
                    context.beginPath();
                    context.fillStyle = '#F80';
                    context.arc(
                        proj(p.l)[0],
                        proj(p.l)[1], p.r,0,2*Math.PI);
                    context.fill();
                    context.closePath();
                    p.r = p.r + 0.2;
                    if (p.r>5) {
                        _.pings.shift();
                    } else if (_.pings.length>1) {
                        var d = _.pings.shift();
                        _.pings.push(d);
                    }
                }, _.drawTo);
            }
        }
    }

    return {
        name: 'pingsCanvas',
        onInit: function onInit() {
            this._.options.showPings = true;
        },
        onInterval: function onInterval() {
            interval.call(this);
        },
        data: function data(data$1) {
            if (data$1) {
                _.dataPings = data$1;
            } else {
                return _.dataPings;
            }
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
    }
}
