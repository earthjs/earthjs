// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function () {
    /*eslint no-console: 0 */
    var _ = {focused: null, svgAddCountriesOld: null}

    function country(cnt, id) {
        id = id.replace('x', '');
        for(var i=0, l=cnt.length; i<l; i++) {
            if(cnt[i].id == id) {return cnt[i];}
        }
    }

    function transition(p) {
        var __ = this._;
        var r = d3.interpolate(__.proj.rotate(), [-p[0], -p[1], 0]);
        var x = function (t) { return __.rotate(r(t)); }; // __.proj.rotate()
        d3.transition()
        .duration(2500)
        .tween('rotate',function () { return x; })
    }

    function create() {
        var _this = this;
        this.worldSvg.$countries()
        .on('click', function() {
            if (_this._.options.enableCenter) {
                var id = this.id.replace('x', '');
                var focusedCountry = country(_this.worldSvg.countries(), id);
                transition.call(_this, d3.geoCentroid(focusedCountry));
                if (typeof(_.focused)==='function') {
                    _.focused.call(_this);
                }
            }
        });
    }

    return {
        name: 'centerSvg',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.enableCenter = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        go: function go(id) {
            var c = this.worldSvg.countries();
            var focusedCountry = country(c, id),
                p = d3.geoCentroid(focusedCountry);
            transition.call(this, p);
        },
        focused: function focused(fn) {
            _.focused = fn;
        }
    }
}
