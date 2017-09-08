// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function (countryNameUrl) {
    /*eslint no-console: 0 */
    var _ = {show: false};
    var countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

    function countryName(d) {
        var cname = '';
        if (_.countryNames) {
            cname = _.countryNames.find(function(x) {
                return x.id==d.id;
            });
        }
        return cname;
    }

    function show(data, tooltip) {
        var title = Object.keys(data).map(function (k) { return k+': '+data[k]; }).join('<br/>');
        return tooltip.html(title)
    }

    function create() {
        var _this = this;
        this.worldSvg.$countries()
        .on('mouseover', function(d) {
            if (_this._.options.showCountryTooltip) {
                _.show = true;
                var country = countryName(d);
                refresh();
                (_.me.show || show)(country, countryTooltip)
                .style('display', 'block')
                .style('opacity', 1);
            }
        })
        .on('mouseout', function() {
            _.show = false;
            countryTooltip.style('opacity', 0)
            .style('display', 'none');
        })
        .on('mousemove', function() {
            if (_this._.options.showCountryTooltip) {
                refresh();
            }
        });
    }

    function refresh(mouse) {
        if (!mouse) {
            mouse = [d3.event.pageX, d3.event.pageY];
        }
        return countryTooltip
        .style('left', (mouse[0] + 7) + 'px')
        .style('top', (mouse[1] - 15) + 'px')
    }

    return {
        name: 'countryTooltipSvg',
        urls: countryNameUrl && [countryNameUrl],
        onReady: function onReady(err, countryNames) {
            _.countryNames = countryNames;
        },
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showCountryTooltip = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            if (this._.drag && _.show) {
                refresh(this.mousePlugin.mouse());
            }
        },
        data: function data(data$1) {
            if (data$1) {
                _.countryNames = data$1;
            } else {
                return _.countryNames;
            }
        },
    }
}
