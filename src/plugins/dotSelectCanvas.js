export default () => {
    /*eslint no-console: 0 */
    const _ = {dataDots: null, dots: null, radiusPath: null,
        onHover: {},
        onHoverKeys: [],
        onClick: {},
        onClickKeys: [],
        onDblClick: {},
        onDblClickKeys: [],
    };

    function detect(mouse, pos) {
        let dot = null;
        _.dots.forEach(function(d) {
            if (mouse && !dot) {
                const geoDistance = d3.geoDistance(d.coordinates, pos);
                if (geoDistance <= 0.02) {
                    dot = d;
                }
            }
        });
        return dot;
    }

    function initCircleHandler() {
        if (this.hoverCanvas) {
            const hoverHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onHoverKeys.forEach(k => {
                    _.onHover[k].call(this, mouse, dot);
                });
                return dot;
            }
            this.hoverCanvas.onCircle({
                dotsCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            const clickHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onClickKeys.forEach(k => {
                    _.onClick[k].call(this, mouse, dot);
                });
                return dot;
            }
            this.clickCanvas.onCircle({
                dotsCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            const dblClickHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onDblClickKeys.forEach(k => {
                    _.onDblClick[k].call(this, mouse, dot);
                });
                return dot;
            }
            this.dblClickCanvas.onCircle({
                dotsCanvas: dblClickHandler
            });
        }
    }

    return {
        name: 'dotSelectCanvas',
        onInit() {
            initCircleHandler.call(this);
        },
        onCreate() {
            if (this.dotsCanvas && !_.dots) {
                this.dotSelectCanvas.dots(this.dotsCanvas.dots());
            }
        },
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverKeys = Object.keys(_.onHover);
        },
        onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickKeys = Object.keys(_.onClick);
        },
        onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickKeys = Object.keys(_.onDblClick);
        },
        dots(dots) {
            _.dots = dots;
        },
    }
}
