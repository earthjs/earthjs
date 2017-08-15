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
        }
    }
}
