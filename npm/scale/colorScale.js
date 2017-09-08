export default function (data, colorRange) {
    if ( colorRange === void 0 ) colorRange=[d3.rgb('#FFAAFF'),d3.rgb("#FF0000")];

    /*eslint no-console: 0 */
    var _ = {};

    return {
        name: 'colorScale',
        onInit: function onInit(me) {
            _.me = me;
            _.me.data(data);
        },
        data: function data(data$1) {
            _.mnMax = d3.extent(data$1);
            _.color = d3.scaleLinear().domain(_.mnMax)
            .interpolate(d3.interpolateHcl).range(colorRange);
        },
        color: function color(value) {
            return _.color(value);
        },
        colors: function colors(arr) {
            return arr.map(function (x){ return _.color(x); });
        },
        colorScale: function colorScale(length) {
            var ttl = 0;
            var arr = [[0,_.me.color(0)]];
            var max = _.mnMax[1]/length;
            for (var i=0;i<length;i++) {
                ttl+=max;
                arr.push([ttl,_.me.color(ttl)]);
            }
            return arr;
        },
        colorRange: function colorRange$1(cRange) {
            if (cRange) {
                colorRange = cRange;
            } else {
                return colorRange;
            }
        }
    }
}
