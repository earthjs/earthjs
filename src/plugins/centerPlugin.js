// KoGor’s Block http://bl.ocks.org/KoGor/5994804
//
export default function() {
    var _ = {focused: null}

    function country(cnt, id) {
        id = id.replace('x', '');
        for(var i=0, l=cnt.length; i<l; i++) {
            if(cnt[i].id == id) {return cnt[i];}
        }
    }

    function transition(p) {
        var _this = this;
        d3.transition()
        .duration(2500)
        .tween("rotate", function() {
            var r = d3.interpolate(_this._.proj.rotate(), [-p[0], -p[1]]);
            return function(t) {
                _this._.rotate(r(t));
            };
        })
    }

    return {
        name: 'centerPlugin',
        onInit() {
            var _this = this;
            var originalsvgAddCountries = this.svgAddCountries;
            this.svgAddCountries = function() {
                return originalsvgAddCountries.call(this)
                .on("click", function() {
                    var id = this.id.replace('x', '');
                    var c = _this.worldPlugin.countries();
                    var focusedCountry = country(c, id);
                    var p = d3.geoCentroid(focusedCountry);
                    transition.call(_this, p);
                    // console.log(id);
                    if (typeof(_.focused)==='function') {
                        _.focused.call(_this);
                    }
                });
            }
        },
        go(id) {
            var c = this.worldPlugin.countries();
            var focusedCountry = country(c, id),
                p = d3.geoCentroid(focusedCountry);
            transition.call(this, p);
        },
        focused(fn) {
            _.focused = fn;
        }
    }
}
