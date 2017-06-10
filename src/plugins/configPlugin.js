export default function() {
    return {
        name: 'configPlugin',
        set(newOpt) {
            if (newOpt) {
                Object.assign(this._.options, newOpt);
                if (newOpt.spin!==undefined) {
                    const rotate = this.autorotatePlugin;
                    newOpt.spin ? rotate.start() :rotate.stop();
                }
                this.svgDraw();
            }
            return Object.assign({}, this._.options);
        }
    }
}
