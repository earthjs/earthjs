export default (data, colorRange=[d3.rgb('#FFAAFF'),d3.rgb("#FF0000")]) => {
    /*eslint no-console: 0 */
    const _ = {};

    return {
        name: 'colorScale',
        onInit(me) {
            _.me = me;
            _.mnMax = d3.extent(data);
            _.color = d3.scaleLinear().domain(_.mnMax)
            .interpolate(d3.interpolateHcl).range(colorRange);
        },
        color(value) {
            return _.color(value);
        },
        colors(arr) {
            return arr.map(x=>_.color(x));
        },
        colorScale(length) {
            let ttl = 0;
            let arr = [[0,_.me.color(0)]];
            const max = _.mnMax[1]/length;
            for (var i=0;i<length;i++) {
                ttl+=max;
                arr.push([ttl,_.me.color(ttl)]);
            }
            return arr;
        },
        colorRange(cRange) {
            if (cRange) {
                colorRange = cRange;
            } else {
                return colorRange;
            }
        }
    }
}
