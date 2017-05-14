export default () => {
    const _ = {checker: []};
    return {
        name: 'commonPlugins',
        onInit() {
            const rg = this.register;
            const pl = earthjs.plugins;
            rg(pl.autorotatePlugin(10));
            rg(pl.versorDragPlugin());
            rg(pl.wheelZoomPlugin());
            rg(pl.configPlugin());
            rg(pl.oceanPlugin());
            rg(pl.canvasPlugin());
            rg(pl.graticuleCanvas());
            rg(pl.worldCanvas('./d/world-110m.json'));

            this.canvasPlugin.selectAll('.canvas');
            this.ready(() => this.svgDraw());

            _.options = this.configPlugin.set();
            _.buttonClick = str => {
                const arr = str.split(':'),
                    key = arr[2],
                    resultx  = {},
                    options  =_.options;
                options[key] = !options[key];
                resultx[key] =  options[key];
                if (key=='hideCountries')
                    resultx.hideLand = false;
                this.configPlugin.set(resultx);
            };

            _.checker = [
                'ocean:Ocean:showOcean',
                'graticule:Graticule:showGraticule',
                'hideLand:Land:showLand',
                'spin:Spin:spin',
            ].map(d => d.split(':'));
            const opt = d3.select('.set-options');
            opt.selectAll('button').data(_.checker).enter().append('button')
                .text(d => d[1])
                .on('click', d => _.buttonClick.call(this, d.join(':')));
        },
        addChecker(checker) {
            _.checker.push(checker);
            _.options = this.configPlugin.set();

            const opt = d3.select('.set-options');
            opt.selectAll('button').data(_.checker).enter().append('button')
                .text(d => d[1])
                .on('click', d => _.buttonClick.call(this, d.join(':')));
        }
    }
}
