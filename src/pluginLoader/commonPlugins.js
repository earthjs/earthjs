export default function(urlWorld='./d/world-110m.json') {
    var _ = {checker: []};
    return {
        name: 'commonPlugins',
        onInit() {
            var p = this;
            p.register(earthjs.plugins.autorotatePlugin(10));
            p.register(earthjs.plugins.versorDragPlugin());
            p.register(earthjs.plugins.wheelZoomPlugin());
            p.register(earthjs.plugins.configPlugin());
            p.register(earthjs.plugins.oceanPlugin());
            p.register(earthjs.plugins.canvasPlugin());
            p.register(earthjs.plugins.graticuleCanvas());
            p.register(earthjs.plugins.worldCanvas('./d/world-110m.json'));

            p.canvasPlugin.selectAll('.canvas');
            p.ready(function(){
                p.svgDraw();
            })

            _.options = p.configPlugin.set();
            console.log(_.options);

            _.buttonClick = function(str) {
                var arr = str.split(':'), key = arr[2];
                var resultx = {};
                _.options[key] = !_.options[key];
                resultx[key]   =  _.options[key];
                console.log(resultx);
                if (key=='hideCountries')
                    resultx.hideLand = false;
                p.configPlugin.set(resultx);
            };

            _.checker = [
                'ocean:Ocean:showOcean',
                'graticule:Graticule:showGraticule',
                'hideLand:Land:showLand',
                'spin:Spin:spin',
            ].map(function(d) {return d.split(':')});
            var opt = d3.select('.set-options');
            opt.selectAll('button').data(_.checker).enter().append('button')
                .text(function(d) { return d[1]})
                .on('click', function(d) {
                    _.buttonClick.call(this, d.join(':'));
                });
        },
        addChecker(checker) {
            _.checker.push(checker);
            _.options = p.configPlugin.set();
            console.log(_.options);

            var opt = d3.select('.set-options');
            opt.selectAll('button').data(_.checker).enter().append('button')
                .text(function(d) {
                    return d[1]
                })
                .on('click', function(d) {
                    _.buttonClick.call(this, d.join(':'));
                });
        }
    }
}
