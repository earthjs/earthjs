export default () => {
    /*eslint no-console: 0 */
    return {
        name: 'configPlugin',
        set(newOpt) {
            if (newOpt) {
                Object.assign(this._.options, newOpt);
                if (newOpt.spin!==undefined) {
                    const rotate = this.autorotatePlugin;
                    newOpt.spin ? rotate.start() :rotate.stop();
                }
                this.create();
            }
            return Object.assign({}, this._.options);
        },
        // resize(parent='body', mouseSelector) {
        //     const _ = this._;
        //     const {options} = _;
        //     const body = d3.select(parent).node();
        //     options.width = body.offsetWidth;
        //     options.height = body.offsetHeight;
        //     let {width, height, padding} = options;
        //     let node = this._.svg.node()
        //     node.setAttribute('width', width);
        //     node.setAttribute('height', height);
        //     const mins = d3.min([width, height]);
        //     this._.proj.translate([width/2, height/2]);
        //     this._.proj.scale(mins / 2 - (padding || 0));
        //     if (this.threejsPlugin) {
        //         node = this.threejsPlugin.node();
        //         node.setAttribute('style', '');
        //         node.setAttribute('width', width);
        //         node.setAttribute('height', height);
        //         this.threejsPlugin.renderer.setSize(width, height);
        //     }
        //     if (this.mousePlugin) {
        //         this.mousePlugin.selectAll(mouseSelector);
        //     }
        // }
    }
}
