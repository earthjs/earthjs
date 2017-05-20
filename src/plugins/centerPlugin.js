// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    const _ = {focused: null, svgAddCountriesOld: null}

    function country(cnt, id) {
        id = id.replace('x', '');
        for(let i=0, l=cnt.length; i<l; i++) {
            if(cnt[i].id == id) {return cnt[i];}
        }
    }

    function transition(p) {
        d3.transition()
        .duration(2500)
        .tween("rotate", () => {
            const  r = d3.interpolate(this._.proj.rotate(), [-p[0], -p[1]]);
            return t => {
                this._.rotate(r(t));
            };
        })
    }

    function svgAddCountries() {
        const _this = this;
        const countries = _.svgAddCountriesOld.call(this);
        countries.on("click", function() {
            const id = this.id.replace('x', '');
            const c = _this.worldPlugin.countries();
            const focusedCountry = country(c, id);
            const p = d3.geoCentroid(focusedCountry);
            transition.call(_this, p);
            if (typeof(_.focused)==='function') {
                _.focused.call(_this);
            }
        });
        return countries;
    }

    return {
        name: 'centerPlugin',
        onInit() {
            _.svgAddCountriesOld = this.$.svgAddCountries;
            this.$.svgAddCountries = svgAddCountries;
        },
        go(id) {
            const c = this.worldPlugin.countries();
            const focusedCountry = country(c, id),
                p = d3.geoCentroid(focusedCountry);
            transition.call(this, p);
        },
        focused(fn) {
            _.focused = fn;
        }
    }
}
