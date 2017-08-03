// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function () {
    /*eslint no-console: 0 */
    var _ = { mouseXY: [0,0], visible: false }
    var barTooltip = d3.select('body').append('div').attr('class', 'ej-bar-tooltip');

    function create() {
        var _this = this;
        this.barSvg.$bar()
        .on('mouseover', function() {
            if (_this._.options.showBarTooltip) {
                _.visible = true;
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                var i = +this.dataset.index;
                var d = _this.barSvg.data().features[i];
                if (_this.barTooltipSvg.onShow) {
                    d = _this.barTooltipSvg.onShow.call(this, d, barTooltip);
                }
                _this.barTooltipSvg.show(d)
                .style('display', 'block')
                .style('opacity', 1);
                refresh();
            }
        })
        .on('mouseout', function() {
            _.visible = false;
            barTooltip.style('opacity', 0)
            .style('display', 'none');
        })
        .on('mousemove', function() {
            if (_this._.options.showBarTooltip) {
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                refresh();
            }
        });
    }

    function refresh() {
        barTooltip
        .style('left', _.mouseXY[0] + 7 + 'px')
        .style('top', _.mouseXY[1] - 15 + 'px');
    }

    function resize() {
        create.call(this);
        barTooltip.style('opacity', 0)
        .style('display', 'none');
    }

    return {
        name: 'barTooltipSvg',
        onInit: function onInit() {
            this._.options.showBarTooltip = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        show: function show(d) {
            var props = d.properties;
            var title = Object.keys(props).map(function (k) { return k+': '+props[k]; }).join('<br/>');
            return barTooltip.html(title)
        },
        visible: function visible() {
            return _.visible;
        }
    }
}
